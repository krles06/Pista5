-- Make ejercicios-imagenes bucket private
UPDATE storage.buckets SET public = false WHERE id = 'ejercicios-imagenes';

-- Make jugadores-fotos bucket private (if it exists)
UPDATE storage.buckets SET public = false WHERE id = 'jugadores-fotos';

-- Drop the old public SELECT policy for ejercicios-imagenes
DROP POLICY IF EXISTS "Images are publicly readable" ON storage.objects;

-- Allow authenticated coaches to read only their own images in ejercicios-imagenes
CREATE POLICY "Coaches can read their own ejercicio images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ejercicios-imagenes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated coaches to read only their own photos in jugadores-fotos
DROP POLICY IF EXISTS "Jugador photos are publicly readable" ON storage.objects;
CREATE POLICY "Coaches can read their own jugador photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'jugadores-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ensure INSERT/UPDATE/DELETE policies exist for jugadores-fotos
CREATE POLICY IF NOT EXISTS "Coaches can upload jugador photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jugadores-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Coaches can update jugador photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'jugadores-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Coaches can delete jugador photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'jugadores-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
