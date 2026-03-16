-- Storage RLS Policies for ejercicios-imagenes bucket

CREATE POLICY "Coaches can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ejercicios-imagenes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coaches can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ejercicios-imagenes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coaches can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ejercicios-imagenes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Images are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ejercicios-imagenes');
