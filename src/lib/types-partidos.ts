export interface Partido {
    id: string;
    coach_id: string;
    id_temporada: string;
    id_microciclo: string | null;
    fecha: string;
    rival: string | null;
    condicion: 'local' | 'visitante';
    goles_local: number | null;
    goles_visitante: number | null;
    notas_tacticas: string | null;
    tipo_partido: string | null;
    created_at: string;
}

export type PartidoInsert = Omit<Partido, 'id' | 'coach_id' | 'created_at'>;
export type PartidoUpdate = Partial<PartidoInsert>;

export interface PartidoJugador {
    id: string;
    id_partido: string;
    id_jugador: string;
    es_titular: boolean;
    minutos_jugados: number;
    jugador?: {
        nombre: string;
        posicion: string;
    };
}

export interface PartidoWithDetalles extends Partido {
    alineacion: PartidoJugador[];
}

export interface AlineacionUpdate {
    id_jugador: string;
    es_titular: boolean;
    minutos_jugados?: number;
}
