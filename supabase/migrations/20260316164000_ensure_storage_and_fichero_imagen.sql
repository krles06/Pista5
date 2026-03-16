-- Ensure storage bucket for exercise images exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('ejercicios-imagenes', 'ejercicios-imagenes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure fichero_imagen column exists in ejercicios table for backward compatibility if needed
ALTER TABLE public.ejercicios 
ADD COLUMN IF NOT EXISTS fichero_imagen text;

-- Sync data (optional but good practice)
UPDATE public.ejercicios SET fichero_imagen = url_imagen WHERE fichero_imagen IS NULL AND url_imagen IS NOT NULL;
UPDATE public.ejercicios SET url_imagen = fichero_imagen WHERE url_imagen IS NULL AND fichero_imagen IS NOT NULL;
