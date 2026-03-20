-- Migration: Create custom exercise categories table
CREATE TABLE IF NOT EXISTS public.categorias_ejercicio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  campo text NOT NULL, -- e.g. 'trabajo', 'tipo_trabajo', 'componente_juego', etc.
  valor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categorias_ejercicio ENABLE ROW LEVEL SECURITY;

-- Policy
DROP POLICY IF EXISTS "Coaches manage own categories" ON public.categorias_ejercicio;
CREATE POLICY "Coaches manage own categories" ON public.categorias_ejercicio
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());
