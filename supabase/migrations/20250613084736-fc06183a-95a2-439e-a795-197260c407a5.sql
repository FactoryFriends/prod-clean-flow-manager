
-- Create enum for task frequencies
CREATE TYPE task_frequency AS ENUM ('daily', 'weekly', 'monthly');

-- Create enum for task statuses
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed', 'overdue');

-- Create enum for locations
CREATE TYPE location_type AS ENUM ('tothai', 'khin');

-- Create table for cleaning task templates
CREATE TABLE public.cleaning_task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location location_type NOT NULL,
  frequency task_frequency NOT NULL,
  estimated_duration INTEGER, -- in minutes
  requires_photo BOOLEAN DEFAULT false,
  favv_compliance BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scheduled cleaning tasks
CREATE TABLE public.cleaning_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.cleaning_task_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location location_type NOT NULL,
  scheduled_date DATE NOT NULL,
  due_time TIME,
  status task_status DEFAULT 'pending',
  assigned_to TEXT, -- 4-digit user code
  assigned_staff_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT, -- 4-digit user code
  completion_notes TEXT,
  photo_urls TEXT[], -- array of photo URLs if photos required
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  favv_compliance BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for staff/user codes (optional for tracking)
CREATE TABLE public.staff_codes (
  code TEXT PRIMARY KEY CHECK (length(code) = 4),
  name TEXT NOT NULL,
  role TEXT,
  location location_type,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some sample staff codes
INSERT INTO public.staff_codes (code, name, role, location) VALUES
('1001', 'Tom van der Berg', 'Kitchen Manager', 'tothai'),
('1002', 'Sarah Johnson', 'Cleaning Staff', 'tothai'),
('1003', 'Mike Chen', 'Kitchen Staff', 'tothai'),
('1004', 'Lisa Rodriguez', 'Cleaning Staff', 'khin'),
('1005', 'KHIN Manager', 'Location Manager', 'khin');

-- Insert sample cleaning task templates
INSERT INTO public.cleaning_task_templates (title, description, location, frequency, estimated_duration, requires_photo, favv_compliance) VALUES
('Deep Clean Production Line 1', 'Complete deep cleaning including equipment sanitization and surface disinfection', 'tothai', 'daily', 240, true, true),
('Restroom Maintenance', 'Daily restroom cleaning and supply restocking', 'tothai', 'daily', 30, false, false),
('Warehouse Floor Cleaning', 'Sweep and mop warehouse floors, organize storage areas', 'tothai', 'daily', 180, false, false),
('Equipment Sanitization', 'Sanitize all quality control equipment and testing stations', 'tothai', 'daily', 120, true, true),
('Weekly Deep Kitchen Clean', 'Comprehensive kitchen deep cleaning including walls, ceiling, and equipment', 'tothai', 'weekly', 480, true, true),
('KHIN Restaurant Floor Cleaning', 'Daily floor cleaning and sanitization', 'khin', 'daily', 120, false, true),
('KHIN Kitchen Equipment Clean', 'Daily kitchen equipment cleaning and sanitization', 'khin', 'daily', 180, true, true);

-- Create function to automatically generate daily tasks
CREATE OR REPLACE FUNCTION generate_daily_cleaning_tasks()
RETURNS void AS $$
BEGIN
  -- Generate daily tasks for today if they don't exist
  INSERT INTO public.cleaning_tasks (template_id, title, description, location, scheduled_date, estimated_duration, favv_compliance)
  SELECT 
    id,
    title,
    description,
    location,
    CURRENT_DATE,
    estimated_duration,
    favv_compliance
  FROM public.cleaning_task_templates
  WHERE frequency = 'daily'
  AND NOT EXISTS (
    SELECT 1 FROM public.cleaning_tasks 
    WHERE template_id = cleaning_task_templates.id 
    AND scheduled_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Generate initial tasks for today
SELECT generate_daily_cleaning_tasks();
