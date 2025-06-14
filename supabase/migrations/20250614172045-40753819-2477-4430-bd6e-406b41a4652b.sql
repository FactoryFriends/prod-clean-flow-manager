
-- First, update any existing tasks with 'other' role to 'cleaner'
UPDATE cleaning_tasks 
SET assigned_role = 'cleaner' 
WHERE assigned_role = 'other';

-- Update any existing templates with 'other' role to 'cleaner'
UPDATE cleaning_task_templates 
SET assigned_role = 'cleaner' 
WHERE assigned_role = 'other';

-- Remove default values first
ALTER TABLE cleaning_tasks 
ALTER COLUMN assigned_role DROP DEFAULT;

ALTER TABLE cleaning_task_templates 
ALTER COLUMN assigned_role DROP DEFAULT;

-- Create a new enum without 'other'
CREATE TYPE staff_role_new AS ENUM ('chef', 'cleaner');

-- Update the tables to use the new enum
ALTER TABLE cleaning_tasks 
ALTER COLUMN assigned_role TYPE staff_role_new 
USING assigned_role::text::staff_role_new;

ALTER TABLE cleaning_task_templates 
ALTER COLUMN assigned_role TYPE staff_role_new 
USING assigned_role::text::staff_role_new;

-- Drop the old enum and rename the new one
DROP TYPE staff_role;
ALTER TYPE staff_role_new RENAME TO staff_role;

-- Add back the default values with the new enum
ALTER TABLE cleaning_tasks 
ALTER COLUMN assigned_role SET DEFAULT 'cleaner'::staff_role;

ALTER TABLE cleaning_task_templates 
ALTER COLUMN assigned_role SET DEFAULT 'cleaner'::staff_role;
