export interface Jugador {
    id: string;
    coach_id: string;
    nombre: string;
    apellidos: string | null;
    posicion: string | null;
    fecha_nacimiento: string | null;
    dorsal: number | null;
    telefono: string | null;
    email: string | null;
    lesionado: boolean;
    notas: string | null;
    url_foto: string | null;
    created_at: string;
    updated_at: string;
}

export type JugadorInsert = Omit<Jugador, 'id' | 'coach_id' | 'created_at' | 'updated_at'>;
export type JugadorUpdate = Partial<JugadorInsert>;
