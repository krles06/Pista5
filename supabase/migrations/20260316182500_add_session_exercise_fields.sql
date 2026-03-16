-- Update sesiones_ejercicios to allow per-session customization of exercise parameters
ALTER TABLE public.sesiones_ejercicios 
ADD COLUMN IF NOT EXISTS minutos integer,
ADD COLUMN IF NOT EXISTS numero_jugadores integer,
ADD COLUMN IF NOT EXISTS series integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS notas_sesion text;

-- Update RLS if needed (assuming public.sesiones_ejercicios already has policies)
-- Usually no change needed if policies are broad enough.
