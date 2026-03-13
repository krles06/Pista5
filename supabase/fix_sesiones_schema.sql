-- ==============================================================================
-- FIX SESIONES SCHEMA
-- Ejecuta esto en el SQL Editor de Supabase para arreglar el error de guardado
-- en la creación y edición de sesiones.
-- ==============================================================================

-- 1. Añadir columnas faltantes a la tabla 'sesiones'
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS lugar text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS observaciones text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS feedback_tactico text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. Migración de datos (opcional): Si tenías datos en 'notas', pásalos a 'observaciones'
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='sesiones' AND column_name='notas') THEN
    UPDATE public.sesiones SET observaciones = notas WHERE observaciones IS NULL AND notas IS NOT NULL;
    -- ALTER TABLE public.sesiones DROP COLUMN IF EXISTS notas; -- Puedes descomentarlo para limpiar
  END IF;
END $$;
