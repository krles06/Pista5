-- ==============================================================================
-- SCHEMA MIGRATION: Phase 2 - Match Reports, Attendance & RPE
-- ==============================================================================

-- 1. Create Lineup (Alineación) Table
CREATE TABLE public.partido_jugadores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_partido uuid REFERENCES public.calendario(id) ON DELETE CASCADE NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id) ON DELETE CASCADE NOT NULL,
    es_titular boolean DEFAULT false,
    minutos_jugados integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure a player isn't listed twice in the same match
    CONSTRAINT unique_jugador_partido UNIQUE (id_partido, id_jugador)
);

-- 2. Create Attendance & RPE Table
CREATE TABLE public.asistencia_sesion (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sesion uuid REFERENCES public.sesiones(id) ON DELETE CASCADE NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id) ON DELETE CASCADE NOT NULL,
    asistio boolean DEFAULT true,
    rpe integer, -- 1-10 scale
    observaciones text, -- Individual player notes
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure a player isn't listed twice in the same session
    CONSTRAINT unique_asistencia UNIQUE (id_sesion, id_jugador),
    CONSTRAINT check_rpe CHECK (rpe >= 1 AND rpe <= 10)
);

-- 3. Add Tactical Feedback field to sesiones
ALTER TABLE public.sesiones ADD COLUMN IF NOT EXISTS feedback_tactico text;

-- 4. Enable RLS
ALTER TABLE public.partido_jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_sesion ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Use existing logic: check coach_id via join
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
