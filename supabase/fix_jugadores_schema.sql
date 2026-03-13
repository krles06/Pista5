-- ==============================================================================
-- FIX JUGADORES SCHEMA
-- Ejecuta esto en el SQL Editor de Supabase para arreglar el error de guardado
-- en la creación y edición de jugadores.
-- ==============================================================================

-- 1. Añadir columnas faltantes a la tabla 'jugadores'
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS apellidos text;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS dorsal integer;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS lesionado boolean DEFAULT false;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS url_foto text;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. Quitar la obligatoriedad de id_temporada
-- Al crear un jugador de forma global (desde la página principal de Jugadores),
-- no siempre estará asociado a una temporada específica en el mismo instante de crearse.
ALTER TABLE public.jugadores ALTER COLUMN id_temporada DROP NOT NULL;
