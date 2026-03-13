export interface Ejercicio {
    id: string;
    coach_id: string;
    titulo: string;
    objetivo_principal: string | null;
    objetivos_secundarios: string | null;
    descripcion: string;
    reglas: string | null;
    dimensiones: string | null;
    material: string | null;
    duracion_minutos: number | null;
    n_jugadores: number | null;
    etapa_sesion: string; // Ej: Calentamiento, Parte Principal, Vuelta a la Calma
    url_imagen: string | null;
    url_video: string | null;
    es_portero: boolean;
    created_at: string;
    updated_at: string;
}
