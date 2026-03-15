import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import { useAuth } from './useAuth';
import type { Partido, PartidoInsert, PartidoUpdate, PartidoWithDetalles, AlineacionUpdate } from '@/lib/types-partidos';

export function usePartidos(id_temporada?: string) {
    const { session } = useAuth();
    return useQuery({
        queryKey: ['partidos', id_temporada, session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();
            let query = supabase
                .from('calendario')
                .select('*')
                .eq('coach_id', userId)
                .order('fecha', { ascending: false });

            if (id_temporada) {
                query = query.eq('id_temporada', id_temporada);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Partido[];
        },
        enabled: !!session?.user?.id,
    });
}

export function usePartido(id?: string) {
    const { session } = useAuth();
    return useQuery({
        queryKey: ['partido', id],
        queryFn: async () => {
            if (!id) return null;
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('calendario')
                .select(`
                    *,
                    alineacion:partido_jugadores(
                        *,
                        jugador:jugadores(nombre, posicion)
                    )
                `)
                .eq('id', id)
                .eq('coach_id', userId)
                .single();

            if (error) throw error;
            return data as PartidoWithDetalles;
        },
        enabled: !!id && !!session?.user?.id,
    });
}

export function useCreatePartido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ partido, alineacion }: { partido: PartidoInsert, alineacion: AlineacionUpdate[] }) => {
            const userId = await getAuthenticatedUserId();

            // 1. Insert partido
            const { data: newPartido, error: pError } = await supabase
                .from('calendario')
                .insert([{ ...partido, coach_id: userId }])
                .select()
                .single();

            if (pError) throw pError;

            // 2. Insert alineacion if any
            if (alineacion.length > 0) {
                const alineacionRows = alineacion.map(a => ({
                    id_partido: newPartido.id,
                    id_jugador: a.id_jugador,
                    es_titular: a.es_titular,
                    minutos_jugados: a.minutos_jugados || 0
                }));

                const { error: aError } = await supabase
                    .from('partido_jugadores')
                    .insert(alineacionRows);

                if (aError) throw aError;
            }

            return newPartido;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
        },
    });
}

export function useUpdatePartido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, alineacion }: { id: string, updates: PartidoUpdate, alineacion?: AlineacionUpdate[] }) => {
            const userId = await getAuthenticatedUserId();

            // 1. Update partido
            const { error: pError } = await supabase
                .from('calendario')
                .update(updates)
                .eq('id', id)
                .eq('coach_id', userId);

            if (pError) throw pError;

            // 2. Update alineacion if provided
            if (alineacion) {
                // Delete existing and insert new (simple approach)
                const { error: dError } = await supabase
                    .from('partido_jugadores')
                    .delete()
                    .eq('id_partido', id);

                if (dError) throw dError;

                if (alineacion.length > 0) {
                    const alineacionRows = alineacion.map(a => ({
                        id_partido: id,
                        id_jugador: a.id_jugador,
                        es_titular: a.es_titular,
                        minutos_jugados: a.minutos_jugados || 0
                    }));

                    const { error: aError } = await supabase
                        .from('partido_jugadores')
                        .insert(alineacionRows);

                    if (aError) throw aError;
                }
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
            queryClient.invalidateQueries({ queryKey: ['partido', variables.id] });
        },
    });
}

export function useDeletePartido() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const userId = await getAuthenticatedUserId();
            const { error } = await supabase
                .from('calendario')
                .delete()
                .eq('id', id)
                .eq('coach_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partidos'] });
        },
    });
}
