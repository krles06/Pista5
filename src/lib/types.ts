export interface Coach {
    id: string;
    nombre: string;
    email: string;
    equipo?: string | null;
    created_at: string;
}

export interface Temporada {
    id: string;
    coach_id: string;
    temporada: string;
    equipo: string;
    categoria?: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    objetivos?: string | null;
    entrenador?: string | null;
    created_at: string;
}
