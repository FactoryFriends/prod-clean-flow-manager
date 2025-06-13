
-- Create storage bucket for cleaning task photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cleaning-photos', 'cleaning-photos', true);

-- Create policy to allow authenticated users to upload photos
CREATE POLICY "Users can upload cleaning photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cleaning-photos' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow public read access to photos
CREATE POLICY "Public can view cleaning photos" ON storage.objects
FOR SELECT USING (bucket_id = 'cleaning-photos');

-- Create policy to allow users to delete their uploaded photos
CREATE POLICY "Users can delete cleaning photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cleaning-photos' AND
  auth.role() = 'authenticated'
);
