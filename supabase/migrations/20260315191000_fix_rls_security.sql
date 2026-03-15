-- ==============================================================================
-- RLS SECURITY FIX — Ensure all tables have RLS enabled and correct policies
-- Run this in the Supabase SQL Editor
-- ==============================================================================

-- ============================================================================
-- STEP 1: Force-enable RLS on ALL tables (safe to re-run)
-- ============================================================================
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macrociclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesociclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microciclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_ejercicios ENABLE ROW LEVEL SECURITY;  -- FIX: was 'ejercicios_sesion' which doesn't exist
ALTER TABLE public.ejercicios_porteros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_sesion_porteros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_jugadores ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop ALL existing policies (so we can recreate cleanly)
-- ============================================================================

-- coaches
DROP POLICY IF EXISTS "Enable insert for authenticated users with their own uid" ON public.coaches;
DROP POLICY IF EXISTS "Users can view own data" ON public.coaches;
DROP POLICY IF EXISTS "Users can update own data" ON public.coaches;
DROP POLICY IF EXISTS "Users can delete own data" ON public.coaches;
DROP POLICY IF EXISTS "Users can insert own data" ON public.coaches;

-- Direct coach_id tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'temporadas', 'equipos', 'macrociclos', 'mesociclos', 'microciclos',
        'sesiones', 'ejercicios', 'ejercicios_porteros', 'jugadores', 'calendario'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON public.%I', tbl);
    END LOOP;
END $$;

-- Junction/mapping tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'sesiones_ejercicios', 'ejercicios_sesion_porteros',
        'asistencia_sesion', 'partido_jugadores'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON public.%I', tbl);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Recreate ALL policies with correct coach_id isolation
-- ============================================================================

-- ---- COACHES (id = auth.uid()) ----
CREATE POLICY "coach_select" ON public.coaches FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "coach_insert" ON public.coaches FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "coach_update" ON public.coaches FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "coach_delete" ON public.coaches FOR DELETE TO authenticated USING (id = auth.uid());

-- ---- DIRECT coach_id TABLES ----
-- temporadas
CREATE POLICY "temporadas_select" ON public.temporadas FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "temporadas_insert" ON public.temporadas FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "temporadas_update" ON public.temporadas FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "temporadas_delete" ON public.temporadas FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- equipos
CREATE POLICY "equipos_select" ON public.equipos FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "equipos_insert" ON public.equipos FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "equipos_update" ON public.equipos FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "equipos_delete" ON public.equipos FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- macrociclos
CREATE POLICY "macrociclos_select" ON public.macrociclos FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "macrociclos_insert" ON public.macrociclos FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "macrociclos_update" ON public.macrociclos FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "macrociclos_delete" ON public.macrociclos FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- mesociclos
CREATE POLICY "mesociclos_select" ON public.mesociclos FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "mesociclos_insert" ON public.mesociclos FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "mesociclos_update" ON public.mesociclos FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "mesociclos_delete" ON public.mesociclos FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- microciclos
CREATE POLICY "microciclos_select" ON public.microciclos FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "microciclos_insert" ON public.microciclos FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "microciclos_update" ON public.microciclos FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "microciclos_delete" ON public.microciclos FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- sesiones
CREATE POLICY "sesiones_select" ON public.sesiones FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "sesiones_insert" ON public.sesiones FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "sesiones_update" ON public.sesiones FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "sesiones_delete" ON public.sesiones FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- ejercicios
CREATE POLICY "ejercicios_select" ON public.ejercicios FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "ejercicios_insert" ON public.ejercicios FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "ejercicios_update" ON public.ejercicios FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "ejercicios_delete" ON public.ejercicios FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- ejercicios_porteros
CREATE POLICY "ejercicios_porteros_select" ON public.ejercicios_porteros FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "ejercicios_porteros_insert" ON public.ejercicios_porteros FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "ejercicios_porteros_update" ON public.ejercicios_porteros FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "ejercicios_porteros_delete" ON public.ejercicios_porteros FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- jugadores
CREATE POLICY "jugadores_select" ON public.jugadores FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "jugadores_insert" ON public.jugadores FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "jugadores_update" ON public.jugadores FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "jugadores_delete" ON public.jugadores FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- calendario (partidos)
CREATE POLICY "calendario_select" ON public.calendario FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "calendario_insert" ON public.calendario FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "calendario_update" ON public.calendario FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "calendario_delete" ON public.calendario FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- ---- JUNCTION/MAPPING TABLES (subquery isolation) ----

-- sesiones_ejercicios (via sesiones.coach_id)
CREATE POLICY "sesiones_ejercicios_select" ON public.sesiones_ejercicios FOR SELECT TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "sesiones_ejercicios_insert" ON public.sesiones_ejercicios FOR INSERT TO authenticated WITH CHECK (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "sesiones_ejercicios_update" ON public.sesiones_ejercicios FOR UPDATE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "sesiones_ejercicios_delete" ON public.sesiones_ejercicios FOR DELETE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);

-- ejercicios_sesion_porteros (via sesiones.coach_id)
CREATE POLICY "ejercicios_sesion_porteros_select" ON public.ejercicios_sesion_porteros FOR SELECT TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "ejercicios_sesion_porteros_insert" ON public.ejercicios_sesion_porteros FOR INSERT TO authenticated WITH CHECK (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "ejercicios_sesion_porteros_update" ON public.ejercicios_sesion_porteros FOR UPDATE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "ejercicios_sesion_porteros_delete" ON public.ejercicios_sesion_porteros FOR DELETE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);

-- asistencia_sesion (via sesiones.coach_id)
CREATE POLICY "asistencia_sesion_select" ON public.asistencia_sesion FOR SELECT TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "asistencia_sesion_insert" ON public.asistencia_sesion FOR INSERT TO authenticated WITH CHECK (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "asistencia_sesion_update" ON public.asistencia_sesion FOR UPDATE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "asistencia_sesion_delete" ON public.asistencia_sesion FOR DELETE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);

-- partido_jugadores (via calendario.coach_id)
CREATE POLICY "partido_jugadores_select" ON public.partido_jugadores FOR SELECT TO authenticated USING (
    id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
);
CREATE POLICY "partido_jugadores_insert" ON public.partido_jugadores FOR INSERT TO authenticated WITH CHECK (
    id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
);
CREATE POLICY "partido_jugadores_update" ON public.partido_jugadores FOR UPDATE TO authenticated USING (
    id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
);
CREATE POLICY "partido_jugadores_delete" ON public.partido_jugadores FOR DELETE TO authenticated USING (
    id_partido IN (SELECT id FROM public.calendario WHERE coach_id = auth.uid())
);

-- ============================================================================
-- STEP 4: VERIFICATION — Run this after the above to confirm
-- ============================================================================

-- Check 1: All tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check 2: All policies exist (should be 60 total: 4 per table × 15 tables)
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
