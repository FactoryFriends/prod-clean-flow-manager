
-- Create the cleaning-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cleaning-photos', 'cleaning-photos', true)
ON CONFLICT (id) DO NOTHING;
