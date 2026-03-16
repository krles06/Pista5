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
    tipo_tarea: string | null;
    tipo_trabajo: string | null;
    trabajo: string | null;
    componente_juego: string | null;
    sistema_juego: string | null;
    dificultad: string | null;
    trabajo_fisico_integrado: string | null;
    url_imagen: string | null;
    fichero_imagen: string | null;
    url_video: string | null;
    es_portero: boolean;
    created_at: string;
    updated_at: string;
}
