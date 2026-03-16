import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import type { Sesion, SesionWithEjercicios, SesionEjercicioInsert } from '@/lib/types-sesiones';
import { useAuth } from './useAuth';

// Fetch all sessions for a specific microcycle with their exercises
export function useSesiones(microcicloId?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['sesiones', microcicloId, session?.user?.id],
        queryFn: async () => {
            if (!microcicloId) return [];
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('sesiones')
                .select(`
                    *,
                    ejercicios:sesiones_ejercicios (
                        id,
                        id_ejercicio,
                        orden,
                        minutos,
                        numero_jugadores,
                        series,
                        notas_sesion,
                        ejercicio:ejercicios (*)
                    )
                `)
                .eq('id_microciclo', microcicloId)
                .eq('coach_id', userId)
                .order('fecha', { ascending: true })
                .order('orden', { foreignTable: 'sesiones_ejercicios', ascending: true });

            if (error) throw error;
            return data as SesionWithEjercicios[];
        },
        enabled: !!microcicloId && !!session?.user?.id,
    });
}

// Fetch all sessions globally for the coach (optional filter by temporadaId)
export function useAllSesiones(temporadaId?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['sesiones-all', temporadaId, session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();

            let query = supabase
                .from('sesiones')
                .select(`
                    *,
                    ejercicios:sesiones_ejercicios (
                        id,
                        id_ejercicio,
                        orden,
                        minutos,
                        numero_jugadores,
                        series,
                        notas_sesion,
                        ejercicio:ejercicios (*)
                    )
                `)
                .eq('coach_id', userId)
                .order('fecha', { ascending: true })
                .order('orden', { foreignTable: 'sesiones_ejercicios', ascending: true });

            if (temporadaId) {
                query = query.eq('id_temporada', temporadaId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as SesionWithEjercicios[];
        },
        enabled: !!session?.user?.id,
    });
}

// Fetch single session with its exercises
export function useSesion(id?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['sesion', id],
        queryFn: async () => {
            if (!id) return null;
            const userId = await getAuthenticatedUserId();

            // Get session data with joined exercises in ONE query
            const { data, error } = await supabase
                .from('sesiones')
                .select(`
                    *,
                    ejercicios:sesiones_ejercicios (
                        id,
                        id_ejercicio,
                        orden,
                        minutos,
                        numero_jugadores,
                        series,
                        notas_sesion,
                        ejercicio:ejercicios (*)
                    )
                `)
                .eq('id', id)
                .eq('coach_id', userId)
                .order('orden', { foreignTable: 'sesiones_ejercicios', ascending: true })
                .single();

            if (error) throw error;

            return data as SesionWithEjercicios;
        },
        enabled: !!id && !!session?.user?.id,
    });
}

// Create session and optionally its exercises
export function useCreateSesion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            sesion,
            ejercicios
        }: {
            sesion: Omit<Sesion, 'id' | 'coach_id' | 'created_at' | 'updated_at'>;
            ejercicios?: Array<{
                id_ejercicio: string;
                minutos?: number;
                numero_jugadores?: number;
                series?: number;
                notas_sesion?: string;
            }>
        }) => {
            const userId = await getAuthenticatedUserId();

            // 1. Insert session
            const { data: newSession, error: sessionError } = await supabase
                .from('sesiones')
                .insert([{ ...sesion, coach_id: userId }])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Insert associated exercises if any
            if (ejercicios && ejercicios.length > 0) {
                const sessionExercises: SesionEjercicioInsert[] = ejercicios.map((ex, index) => ({
                    id_sesion: newSession.id,
                    id_ejercicio: ex.id_ejercicio,
                    orden: index + 1,
                    minutos: ex.minutos,
                    numero_jugadores: ex.numero_jugadores,
                    series: ex.series,
                    notas_sesion: ex.notas_sesion
                }));

                const { error: junctionError } = await supabase
                    .from('sesiones_ejercicios')
                    .insert(sessionExercises);

                if (junctionError) throw junctionError;
            }

            return newSession as Sesion;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sesiones', variables.sesion.id_microciclo] });
            queryClient.invalidateQueries({ queryKey: ['sesiones-all'] });
        },
    });
}

// Update session and its set of exercises
export function useUpdateSesion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            updates,
            ejercicios
        }: {
            id: string;
            updates: Partial<Sesion>;
            ejercicios?: Array<{
                id_ejercicio: string;
                minutos?: number;
                numero_jugadores?: number;
                series?: number;
                notas_sesion?: string;
            }>
        }) => {
            await getAuthenticatedUserId(); // ensure user is authenticated

            // 1. Update session basic data
            const { data: updatedSession, error: sessionError } = await supabase
                .from('sesiones')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Update exercises association if provided
            if (ejercicios !== undefined) {
                // Delete previous associations
                const { error: deleteError } = await supabase
                    .from('sesiones_ejercicios')
                    .delete()
                    .eq('id_sesion', id);

                if (deleteError) throw deleteError;

                // Insert new ones
                if (ejercicios.length > 0) {
                    const sessionExercises: SesionEjercicioInsert[] = ejercicios.map((ex, index) => ({
                        id_sesion: id,
                        id_ejercicio: ex.id_ejercicio,
                        orden: index + 1,
                        minutos: ex.minutos,
                        numero_jugadores: ex.numero_jugadores,
                        series: ex.series,
                        notas_sesion: ex.notas_sesion
                    }));

                    const { error: insertError } = await supabase
                        .from('sesiones_ejercicios')
                        .insert(sessionExercises);

                    if (insertError) throw insertError;
                }
            }

            return updatedSession as Sesion;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['sesiones', data.id_microciclo] });
            queryClient.invalidateQueries({ queryKey: ['sesion', data.id] });
            queryClient.invalidateQueries({ queryKey: ['sesiones-all'] });
        },
    });
}

// Delete session
export function useDeleteSesion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('sesiones')
                .delete()
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Sesion;
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['sesiones', data.id_microciclo] });
                queryClient.invalidateQueries({ queryKey: ['sesiones-all'] });
            }
        },
    });
}
