
-- First add the initials column (this should work)
ALTER TABLE public.staff_codes 
ADD COLUMN IF NOT EXISTS initials text;

-- Update existing records to set initials based on name (first letter of each word)
UPDATE public.staff_codes 
SET initials = (
  SELECT string_agg(left(word, 1), '')
  FROM (
    SELECT unnest(string_to_array(name, ' ')) as word
  ) words
)
WHERE initials IS NULL AND name IS NOT NULL;

-- Clean up orphaned references in cleaning_tasks before adding foreign keys
-- Set completed_by to NULL where the staff code doesn't exist
UPDATE public.cleaning_tasks 
SET completed_by = NULL 
WHERE completed_by IS NOT NULL 
AND completed_by NOT IN (SELECT code FROM public.staff_codes);

-- Set assigned_to to NULL where the staff code doesn't exist
UPDATE public.cleaning_tasks 
SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
AND assigned_to NOT IN (SELECT code FROM public.staff_codes);

-- Now add the foreign key constraints
DO $$
BEGIN
  -- Add foreign key for completed_by if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cleaning_tasks_completed_by_fkey'
    AND table_name = 'cleaning_tasks'
  ) THEN
    ALTER TABLE public.cleaning_tasks 
    ADD CONSTRAINT cleaning_tasks_completed_by_fkey 
    FOREIGN KEY (completed_by) REFERENCES public.staff_codes(code);
  END IF;

  -- Add foreign key for assigned_to if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cleaning_tasks_assigned_to_fkey'
    AND table_name = 'cleaning_tasks'
  ) THEN
    ALTER TABLE public.cleaning_tasks 
    ADD CONSTRAINT cleaning_tasks_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES public.staff_codes(code);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_completed_by ON public.cleaning_tasks(completed_by);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assigned_to ON public.cleaning_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_codes_code ON public.staff_codes(code);
