
-- First, let's check what columns exist and add missing ones
-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'status') THEN
        ALTER TABLE public.cleaning_tasks ADD COLUMN status task_status DEFAULT 'pending';
    END IF;
END $$;

-- Create staff_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
        CREATE TYPE staff_role AS ENUM ('chef', 'cleaner', 'other');
    END IF;
END $$;

-- Update task_frequency enum to include quarterly if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'quarterly' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_frequency')) THEN
        ALTER TYPE task_frequency ADD VALUE 'quarterly';
    END IF;
END $$;

-- Now drop and recreate task_status enum with only open/closed
DROP TYPE IF EXISTS task_status CASCADE;
CREATE TYPE task_status AS ENUM ('open', 'closed');

-- Re-add status column with correct type
ALTER TABLE public.cleaning_tasks DROP COLUMN IF EXISTS status;
ALTER TABLE public.cleaning_tasks ADD COLUMN status task_status DEFAULT 'open';

-- Add new columns to cleaning_task_templates if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_task_templates' AND column_name = 'assigned_role') THEN
        ALTER TABLE public.cleaning_task_templates ADD COLUMN assigned_role staff_role DEFAULT 'other';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_task_templates' AND column_name = 'weekly_day_of_week') THEN
        ALTER TABLE public.cleaning_task_templates ADD COLUMN weekly_day_of_week INTEGER CHECK (weekly_day_of_week BETWEEN 1 AND 7);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_task_templates' AND column_name = 'monthly_day_of_month') THEN
        ALTER TABLE public.cleaning_task_templates ADD COLUMN monthly_day_of_month INTEGER CHECK (monthly_day_of_month BETWEEN 1 AND 31);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_task_templates' AND column_name = 'quarterly_start_month') THEN
        ALTER TABLE public.cleaning_task_templates ADD COLUMN quarterly_start_month INTEGER CHECK (quarterly_start_month BETWEEN 1 AND 12);
    END IF;
END $$;

-- Add assigned_role column to cleaning_tasks if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_role') THEN
        ALTER TABLE public.cleaning_tasks ADD COLUMN assigned_role staff_role DEFAULT 'other';
    END IF;
END $$;

-- Update staff_codes table role column type
ALTER TABLE public.staff_codes ALTER COLUMN role TYPE text;

-- Create improved function to generate tasks based on frequency and scheduling
CREATE OR REPLACE FUNCTION generate_scheduled_cleaning_tasks()
RETURNS void AS $$
DECLARE
  template_rec RECORD;
  target_date DATE;
  should_create BOOLEAN;
BEGIN
  FOR template_rec IN 
    SELECT * FROM public.cleaning_task_templates 
  LOOP
    should_create := FALSE;
    target_date := CURRENT_DATE;
    
    CASE template_rec.frequency
      WHEN 'daily' THEN
        should_create := TRUE;
        
      WHEN 'weekly' THEN
        -- Create if today matches the specified day of week
        IF template_rec.weekly_day_of_week IS NOT NULL AND 
           EXTRACT(DOW FROM CURRENT_DATE) = template_rec.weekly_day_of_week - 1 THEN
          should_create := TRUE;
        END IF;
        
      WHEN 'monthly' THEN
        -- Create if today matches the specified day of month
        IF template_rec.monthly_day_of_month IS NOT NULL AND 
           EXTRACT(DAY FROM CURRENT_DATE) = template_rec.monthly_day_of_month THEN
          should_create := TRUE;
        END IF;
        
      WHEN 'quarterly' THEN
        -- Create if today is first day of quarter starting month
        IF template_rec.quarterly_start_month IS NOT NULL AND 
           EXTRACT(MONTH FROM CURRENT_DATE) IN (
             template_rec.quarterly_start_month,
             template_rec.quarterly_start_month + 3,
             template_rec.quarterly_start_month + 6,
             template_rec.quarterly_start_month + 9
           ) AND EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
          should_create := TRUE;
        END IF;
    END CASE;
    
    -- Only create if task doesn't already exist for today
    IF should_create AND NOT EXISTS (
      SELECT 1 FROM public.cleaning_tasks 
      WHERE template_id = template_rec.id 
      AND scheduled_date = target_date
    ) THEN
      INSERT INTO public.cleaning_tasks (
        template_id, title, description, location, scheduled_date, 
        estimated_duration, favv_compliance, assigned_role, status
      ) VALUES (
        template_rec.id, template_rec.title, template_rec.description, 
        template_rec.location, target_date, template_rec.estimated_duration, 
        template_rec.favv_compliance, template_rec.assigned_role, 'open'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing task templates with roles (you can modify these as needed)
UPDATE public.cleaning_task_templates SET assigned_role = 'chef' 
WHERE title LIKE '%Kitchen%' OR title LIKE '%Equipment%';

UPDATE public.cleaning_task_templates SET assigned_role = 'cleaner' 
WHERE title LIKE '%Floor%' OR title LIKE '%Restroom%' OR title LIKE '%Clean%';

-- Set weekly day for weekly tasks (Monday = 1)
UPDATE public.cleaning_task_templates SET weekly_day_of_week = 1 
WHERE frequency = 'weekly';

-- Generate initial tasks
SELECT generate_scheduled_cleaning_tasks();
