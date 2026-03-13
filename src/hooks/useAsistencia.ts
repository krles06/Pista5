import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { AsistenciaSesion, AsistenciaUpdate } from '@/lib/types-sesiones';

export function useAsistencia(id_sesion?: string) {
    const { coach } = useAuth();
    return useQuery({
        queryKey: ['asistencia', id_sesion],
        queryFn: async () => {
            if (!coach || !id_sesion) return [];
            const { data, error } = await supabase
                .from('asistencia_sesion')
                .select(`
                    *,
                    jugador:jugadores(nombre, posicion)
                `)
                .eq('id_sesion', id_sesion)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as AsistenciaSesion[];
        },
        enabled: !!coach && !!id_sesion,
    });
}

export function useUpdateAsistencia() {
    const queryClient = useQueryClient();
    const { coach } = useAuth();

    return useMutation({
        mutationFn: async ({ id_sesion, asistencia }: { id_sesion: string, asistencia: AsistenciaUpdate[] }) => {
            if (!coach) throw new Error('No coach found');

            // 1. Delete existing for this session
            const { error: dError } = await supabase
                .from('asistencia_sesion')
                .delete()
                .eq('id_sesion', id_sesion);

            if (dError) throw dError;

            // 2. Insert new ones
            if (asistencia.length > 0) {
                const rows = asistencia.map(a => ({
                    id_sesion,
                    id_jugador: a.id_jugador,
                    asistio: a.asistio,
                    rpe: a.rpe,
                    observaciones: a.observaciones
                }));

                const { error: iError } = await supabase
                    .from('asistencia_sesion')
                    .insert(rows);

                if (iError) throw iError;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['asistencia', variables.id_sesion] });
        },
    });
}
