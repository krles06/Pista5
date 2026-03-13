-- ==============================================================================
-- FIX EJERCICIOS SCHEMA
-- Run this in the Supabase SQL Editor to align the database with the frontend.
-- ==============================================================================

-- 1. Add missing columns to 'ejercicios' table
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS titulo text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS objetivo_principal text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS objetivos_secundarios text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS reglas text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS dimensiones text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS duracion_minutos integer;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS n_jugadores integer;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS etapa_sesion text DEFAULT 'Parte Principal';
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS url_imagen text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS url_video text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS es_portero boolean DEFAULT false;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. Rename 'ejercicios_sesion' to 'sesiones_ejercicios' to match hooks
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ejercicios_sesion') THEN
    ALTER TABLE public.ejercicios_sesion RENAME TO sesiones_ejercicios;
  END IF;
END $$;

-- 3. Data Migration: Copy existing data to new columns (if applicable)
UPDATE public.ejercicios SET titulo = nombre WHERE titulo IS NULL;
UPDATE public.ejercicios SET duracion_minutos = CAST(minutos AS integer) WHERE duracion_minutos IS NULL AND minutos IS NOT NULL;
UPDATE public.ejercicios SET url_imagen = fichero_imagen WHERE url_imagen IS NULL;

-- 4. Make required columns NOT NULL (after migration)
ALTER TABLE public.ejercicios ALTER COLUMN titulo SET NOT NULL;
ALTER TABLE public.ejercicios ALTER COLUMN etapa_sesion SET NOT NULL;
ALTER TABLE public.ejercicios ALTER COLUMN es_portero SET NOT NULL;

-- 5. Fix "nombre" NOT NULL constraint error
-- Since we use "titulo" now, we make "nombre" nullable so old schema doesn't break inserts
ALTER TABLE public.ejercicios ALTER COLUMN nombre DROP NOT NULL;

-- 6. (Optional) Cleanup old columns if you don't need them anymore
-- ALTER TABLE public.ejercicios DROP COLUMN IF EXISTS nombre;
-- ALTER TABLE public.ejercicios DROP COLUMN IF EXISTS minutos;
-- ALTER TABLE public.ejercicios DROP COLUMN IF EXISTS numero_jugadores;
-- ALTER TABLE public.ejercicios DROP COLUMN IF EXISTS fichero_imagen;
