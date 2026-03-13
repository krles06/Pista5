-- ==============================================================================
-- CHECKEO GENERAL DE BASE DE DATOS (FASE 1 Y FASE 2)
-- Ejecuta este script en el SQL Editor de Supabase para asegurarte de que
-- TODAS las tablas y columnas necesarias para la aplicación existen y están bien configuradas.
-- ==============================================================================

-- 1. TABLA: SESIONES (Comprobación extra de los campos)
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS lugar text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS observaciones text;
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS feedback_tactico text;

-- 2. TABLA: JUGADORES (Comprobación extra de los campos)
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS apellidos text;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS dorsal integer;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS lesionado boolean DEFAULT false;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE public.jugadores ADD COLUMN IF NOT EXISTS url_foto text;
ALTER TABLE public.jugadores ALTER COLUMN id_temporada DROP NOT NULL;

-- 3. TABLA: CALENDARIO (PARTIDOS)
-- La tabla de partidos se llama calendario en Supabase
ALTER TABLE public.calendario ADD COLUMN IF NOT EXISTS rival text;
ALTER TABLE public.calendario ADD COLUMN IF NOT EXISTS condicion text; -- local/visitante
ALTER TABLE public.calendario ADD COLUMN IF NOT EXISTS goles_local integer;
ALTER TABLE public.calendario ADD COLUMN IF NOT EXISTS goles_visitante integer;
ALTER TABLE public.calendario ADD COLUMN IF NOT EXISTS notas_tacticas text;
ALTER TABLE public.calendario ADD COLUMN IF NOT EXISTS tipo_partido text;

-- 4. NUEVAS TABLAS DE RELACIÓN (Asistencia a sesiones y Alineaciones de partidos)
-- Tabla de asistencia a las sesiones de entrenamiento
CREATE TABLE IF NOT EXISTS public.asistencia_sesion (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sesion uuid REFERENCES public.sesiones(id) ON DELETE CASCADE NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id) ON DELETE CASCADE NOT NULL,
    asistio boolean DEFAULT true,
    rpe integer,
    observaciones text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_asistencia UNIQUE (id_sesion, id_jugador)
);

-- Tabla de alineaciones en días de partido
CREATE TABLE IF NOT EXISTS public.partido_jugadores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_partido uuid REFERENCES public.calendario(id) ON DELETE CASCADE NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id) ON DELETE CASCADE NOT NULL,
    es_titular boolean DEFAULT false,
    minutos_jugados integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_alineacion UNIQUE (id_partido, id_jugador)
);

-- Habilitar RLS en estas tablas
ALTER TABLE public.asistencia_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_jugadores ENABLE ROW LEVEL SECURITY;

-- Aplicar políticas de acceso generales usando nuestras funciones ya creadas
DO $$
BEGIN
    -- Politicas Asistencia Sesion
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own data' AND tablename = 'asistencia_sesion') THEN
        CREATE POLICY "Users can view own data" ON public.asistencia_sesion FOR SELECT TO authenticated USING (
            id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
        );
        CREATE POLICY "Users can insert own data" ON public.asistencia_sesion FOR INSERT TO authenticated WITH CHECK (
            id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
        );
        CREATE POLICY "Users can update own data" ON public.asistencia_sesion FOR UPDATE TO authenticated USING (
            id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
        );
        CREATE POLICY "Users can delete own data" ON public.asistencia_sesion FOR DELETE TO authenticated USING (
            id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
        );
    END IF;

    -- Politicas Partido Jugadores (Alineaciones)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own data' AND tablename = 'partido_jugadores') THEN
        CREATE POLICY "Users can view own data" ON public.partido_jugadores FOR SELECT TO authenticated USING (
            id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
        );
        CREATE POLICY "Users can insert own data" ON public.partido_jugadores FOR INSERT TO authenticated WITH CHECK (
            id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
        );
        CREATE POLICY "Users can update own data" ON public.partido_jugadores FOR UPDATE TO authenticated USING (
            id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
        );
        CREATE POLICY "Users can delete own data" ON public.partido_jugadores FOR DELETE TO authenticated USING (
            id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
        );
    END IF;
END $$;
