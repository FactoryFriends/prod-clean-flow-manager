
-- Add active column to cleaning_task_templates table
ALTER TABLE public.cleaning_task_templates 
ADD COLUMN active boolean NOT NULL DEFAULT true;
