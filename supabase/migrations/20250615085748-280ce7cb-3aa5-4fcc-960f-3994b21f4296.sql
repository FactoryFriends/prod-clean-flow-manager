
-- Update storage policies to allow authenticated users to upload photos
DROP POLICY IF EXISTS "Users can upload cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete cleaning photos" ON storage.objects;

-- Create policy to allow anyone to upload photos (since we don't have user authentication)
CREATE POLICY "Allow photo uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cleaning-photos'
);

-- Create policy to allow anyone to view photos
CREATE POLICY "Allow photo viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'cleaning-photos');

-- Create policy to allow photo deletion
CREATE POLICY "Allow photo deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'cleaning-photos');
