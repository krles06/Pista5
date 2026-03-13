export interface Macrociclo {
    id: string;
    coach_id: string;
    id_temporada: string;
    nombre: string;
    tipo: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    objetivos: string | null;
    created_at: string;
}

export interface Mesociclo {
    id: string;
    coach_id: string;
    id_macrociclo: string;
    nombre: string;
    tipo: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    objetivos: string | null;
    created_at: string;
}

export interface Microciclo {
    id: string;
    coach_id: string;
    id_mesociclo: string;
    nombre: string;
    tipo: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    objetivos: string | null;
    created_at: string;
}
