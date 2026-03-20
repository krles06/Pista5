-- Fix columns that might be boolean instead of text
ALTER TABLE public.ejercicios 
  ALTER COLUMN tipo_tarea TYPE text USING tipo_tarea::text,
  ALTER COLUMN tipo_trabajo TYPE text USING tipo_trabajo::text,
  ALTER COLUMN trabajo TYPE text USING trabajo::text,
  ALTER COLUMN componente_juego TYPE text USING componente_juego::text,
  ALTER COLUMN sistema_juego TYPE text USING sistema_juego::text,
  ALTER COLUMN dificultad TYPE text USING dificultad::text,
  ALTER COLUMN trabajo_fisico_integrado TYPE text USING trabajo_fisico_integrado::text;
