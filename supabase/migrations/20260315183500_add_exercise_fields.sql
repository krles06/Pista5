-- Add categorical columns to ejercicios table
ALTER TABLE public.ejercicios 
ADD COLUMN IF NOT EXISTS tipo_tarea text,
ADD COLUMN IF NOT EXISTS tipo_trabajo text,
ADD COLUMN IF NOT EXISTS trabajo text,
ADD COLUMN IF NOT EXISTS componente_juego text,
ADD COLUMN IF NOT EXISTS sistema_juego text,
ADD COLUMN IF NOT EXISTS dificultad text,
ADD COLUMN IF NOT EXISTS trabajo_fisico_integrado text;
