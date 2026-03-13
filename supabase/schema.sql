-- ==============================================================================
-- SCHEMA MIGRATION SCRIPT FOR PISTA5 ERP (Fase 1 y 2)
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Create Tables

-- Coaches
CREATE TABLE public.coaches (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nombre text NOT NULL,
    email text NOT NULL,
    equipo text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Temporadas
CREATE TABLE public.temporadas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    temporada text NOT NULL,
    equipo text NOT NULL,
    categoria text,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    objetivos text,
    entrenador text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_fechas CHECK (fecha_fin >= fecha_inicio)
);

-- Equipos (Registros de equipos)
CREATE TABLE public.equipos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    nombre text NOT NULL,
    categoria text,
    presidente text,
    pabellon text,
    telefono text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Macrociclos (Fase 1 completada)
CREATE TABLE public.macrociclos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    id_temporada uuid REFERENCES public.temporadas(id) ON DELETE CASCADE NOT NULL,
    nombre text NOT NULL,
    tipo text,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    objetivos text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_fechas_macro CHECK (fecha_fin >= fecha_inicio)
);

-- Mesociclos (Fase 1 completada)
CREATE TABLE public.mesociclos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    id_macrociclo uuid REFERENCES public.macrociclos(id) ON DELETE CASCADE NOT NULL,
    nombre text NOT NULL,
    tipo text,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    objetivos text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_fechas_meso CHECK (fecha_fin >= fecha_inicio)
);

-- Microciclos (Fase 1 completada)
CREATE TABLE public.microciclos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    id_mesociclo uuid REFERENCES public.mesociclos(id) ON DELETE CASCADE NOT NULL,
    nombre text NOT NULL,
    tipo text,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    objetivos text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_fechas_micro CHECK (fecha_fin >= fecha_inicio)
);

-- Sesiones
CREATE TABLE public.sesiones (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    id_temporada uuid REFERENCES public.temporadas(id) ON DELETE CASCADE NOT NULL,
    id_microciclo uuid REFERENCES public.microciclos(id) ON DELETE CASCADE NOT NULL,
    fecha date NOT NULL,
    hora_inicio time without time zone,
    hora_fin time without time zone,
    lugar text,
    objetivos text,
    material text,
    observaciones text,
    feedback_tactico text,
    numero_sesion numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Ejercicios (Biblioteca General)
CREATE TABLE public.ejercicios (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    titulo text NOT NULL,
    objetivo_principal text,
    objetivos_secundarios text,
    descripcion text,
    reglas text,
    dimensiones text,
    material text,
    duracion_minutos integer,
    n_jugadores integer,
    etapa_sesion text NOT NULL DEFAULT 'Parte Principal',
    url_imagen text,
    url_video text,
    es_portero boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sesiones_Ejercicios (Relación M:N)
CREATE TABLE public.sesiones_ejercicios (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sesion uuid REFERENCES public.sesiones(id) ON DELETE CASCADE NOT NULL,
    id_ejercicio uuid REFERENCES public.ejercicios(id) ON DELETE CASCADE NOT NULL,
    orden integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ejercicios_Porteros (Biblioteca PT)
CREATE TABLE public.ejercicios_porteros (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    nombre text NOT NULL,
    tipo_tarea_pt text,
    tipo_trabajo_pt text,
    trabajo_pt text,
    dificultad text,
    minutos numeric,
    descripcion text,
    fichero_imagen text, -- URL in Storage
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ejercicios_Sesion_Porteros (Relación M:N para PT)
CREATE TABLE public.ejercicios_sesion_porteros (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sesion uuid REFERENCES public.sesiones(id) ON DELETE CASCADE NOT NULL,
    id_ejercicio_portero uuid REFERENCES public.ejercicios_porteros(id) ON DELETE CASCADE NOT NULL,
    numero_porteros numeric,
    minutos numeric NOT NULL,
    orden integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jugadores (Fase 2)
CREATE TABLE public.jugadores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    id_temporada uuid REFERENCES public.temporadas(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    apellidos text,
    nombre_completo text,
    posicion text,
    posicion_alternativa text,
    fecha_nacimiento date,
    dorsal integer,
    telefono text,
    poblacion text,
    email text,
    lesionado boolean DEFAULT false,
    notas text,
    url_foto text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_jugador_temporada UNIQUE (id_temporada, nombre)
);

-- Calendario (Fase 2)
CREATE TABLE public.calendario (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    id_temporada uuid REFERENCES public.temporadas(id) ON DELETE CASCADE NOT NULL,
    id_microciclo uuid REFERENCES public.microciclos(id) ON DELETE CASCADE NOT NULL,
    fecha timestamp with time zone NOT NULL,
    rival text,
    condicion text, -- local/visitante
    goles_local integer,
    goles_visitante integer,
    notas_tacticas text,
    tipo_partido text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asistencia Sesion (Relación Sesion <-> Jugador)
CREATE TABLE public.asistencia_sesion (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sesion uuid REFERENCES public.sesiones(id) ON DELETE CASCADE NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id) ON DELETE CASCADE NOT NULL,
    asistio boolean DEFAULT true,
    rpe integer,
    observaciones text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_asistencia UNIQUE (id_sesion, id_jugador)
);

-- Partido Jugadores (Alineación)
CREATE TABLE public.partido_jugadores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    id_partido uuid REFERENCES public.calendario(id) ON DELETE CASCADE NOT NULL,
    id_jugador uuid REFERENCES public.jugadores(id) ON DELETE CASCADE NOT NULL,
    es_titular boolean DEFAULT false,
    minutos_jugados integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_alineacion UNIQUE (id_partido, id_jugador)
);

-- ==============================================================================
-- 2. Enable Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macrociclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesociclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microciclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_porteros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_sesion_porteros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_jugadores ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Create RLS Policies
-- Every coach_id restricted to the authenticated user's ID
-- ==============================================================================

-- Coaches Table Policies
CREATE POLICY "Enable insert for authenticated users with their own uid" ON public.coaches FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own data" ON public.coaches FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON public.coaches FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can delete own data" ON public.coaches FOR DELETE TO authenticated USING (id = auth.uid());

-- Reusable procedure for coach_id table policies
CREATE OR REPLACE FUNCTION create_coach_policies(table_name text) RETURNS void AS $$
BEGIN
    EXECUTE format('CREATE POLICY "Users can view own data" ON %I FOR SELECT TO authenticated USING (coach_id = auth.uid());', table_name);
    EXECUTE format('CREATE POLICY "Users can insert own data" ON %I FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());', table_name);
    EXECUTE format('CREATE POLICY "Users can update own data" ON %I FOR UPDATE TO authenticated USING (coach_id = auth.uid());', table_name);
    EXECUTE format('CREATE POLICY "Users can delete own data" ON %I FOR DELETE TO authenticated USING (coach_id = auth.uid());', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to direct coach_id tables
SELECT create_coach_policies('temporadas');
SELECT create_coach_policies('equipos');
SELECT create_coach_policies('macrociclos');
SELECT create_coach_policies('mesociclos');
SELECT create_coach_policies('microciclos');
SELECT create_coach_policies('sesiones');
SELECT create_coach_policies('ejercicios');
SELECT create_coach_policies('ejercicios_porteros');
SELECT create_coach_policies('jugadores');
SELECT create_coach_policies('calendario');

-- For mapping tables without coach_id, we need to join to check ownership 
-- (This is safer than relying on client input)
-- sesiones_ejercicios
CREATE POLICY "Users can view own data" ON public.sesiones_ejercicios FOR SELECT TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "Users can insert own data" ON public.sesiones_ejercicios FOR INSERT TO authenticated WITH CHECK (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "Users can update own data" ON public.sesiones_ejercicios FOR UPDATE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "Users can delete own data" ON public.sesiones_ejercicios FOR DELETE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);

-- Ejercicios_Sesion_Porteros
CREATE POLICY "Users can view own data" ON public.ejercicios_sesion_porteros FOR SELECT TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "Users can insert own data" ON public.ejercicios_sesion_porteros FOR INSERT TO authenticated WITH CHECK (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "Users can update own data" ON public.ejercicios_sesion_porteros FOR UPDATE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);
CREATE POLICY "Users can delete own data" ON public.ejercicios_sesion_porteros FOR DELETE TO authenticated USING (
    id_sesion IN (SELECT id FROM public.sesiones WHERE coach_id = auth.uid())
);

-- asistencia_sesion
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

-- partido_jugadores
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


-- ==============================================================================
-- 4. Initial Storage Bucket Setup
-- ==============================================================================
-- This needs to be run in the Storage SQL console, or you can create it via UI.
-- 
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ejercicios-imagenes', 'ejercicios-imagenes', true);
-- CREATE POLICY "Give authenticated users access to folder" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'ejercicios-imagenes' AND auth.uid()::text = (storage.foldername(name))[1]);
-- ==============================================================================
