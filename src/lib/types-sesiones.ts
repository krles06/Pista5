import type { Ejercicio } from './types-ejercicios';

export interface Sesion {
    id: string;
    coach_id: string;
    id_temporada: string;
    id_microciclo: string;
    fecha: string;
    lugar: string | null;
    objetivos: string | null;
    material: string | null;
    observaciones: string | null;
    feedback_tactico: string | null;
    created_at: string;
    updated_at: string;
}

export interface SesionWithEjercicios extends Sesion {
    ejercicios: {
        id: string;
        id_ejercicio: string;
        orden: number;
        ejercicio: Ejercicio;
        minutos?: number;
        numero_jugadores?: number;
        series?: number;
        notas_sesion?: string;
    }[];
}

export interface SesionEjercicioInsert {
    id_sesion: string;
    id_ejercicio: string;
    orden: number;
    minutos?: number;
    numero_jugadores?: number;
    series?: number;
    notas_sesion?: string | null;
}

export interface AsistenciaSesion {
    id: string;
    id_sesion: string;
    id_jugador: string;
    asistio: boolean;
    rpe: number | null;
    observaciones: string | null;
    created_at: string;
    jugador?: {
        nombre: string;
        posicion: string;
    };
}

export type AsistenciaUpdate = {
    id_jugador: string;
    asistio: boolean;
    rpe?: number | null;
    observaciones?: string | null;
};
