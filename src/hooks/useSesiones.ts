import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Sesion, SesionWithEjercicios, SesionEjercicioInsert } from '@/lib/types-sesiones';
import { useAuth } from './useAuth';

// Fetch all sessions for a specific microcycle
export function useSesiones(microcicloId?: string) {
    const { coach } = useAuth();

    return useQuery({
        queryKey: ['sesiones', microcicloId],
        queryFn: async () => {
            if (!microcicloId || !coach?.id) return [];

            const { data, error } = await supabase
                .from('sesiones')
                .select('*')
                .eq('id_microciclo', microcicloId)
                .order('fecha', { ascending: true });

            if (error) throw error;
            return data as Sesion[];
        },
        enabled: !!microcicloId && !!coach?.id,
    });
}

// Fetch single session with its exercises
export function useSesion(id?: string) {
    const { coach } = useAuth();

    return useQuery({
        queryKey: ['sesion', id],
        queryFn: async () => {
            if (!id || !coach?.id) return null;

            // Get session data
            const { data: sessionData, error: sessionError } = await supabase
                .from('sesiones')
                .select('*')
                .eq('id', id)
                .eq('coach_id', coach.id)
                .single();

            if (sessionError) throw sessionError;

            // Get exercises associated with this session
            const { data: exercisesData, error: exercisesError } = await supabase
                .from('sesiones_ejercicios')
                .select(`
          id,
          id_ejercicio,
          orden,
          ejercicio:ejercicios(*)
        `)
                .eq('id_sesion', id)
                .order('orden', { ascending: true });

            if (exercisesError) throw exercisesError;

            return {
                ...sessionData,
                ejercicios: exercisesData,
            } as SesionWithEjercicios;
        },
        enabled: !!id && !!coach?.id,
    });
}

// Create session and optionally its exercises
export function useCreateSesion() {
    const queryClient = useQueryClient();
    const { coach } = useAuth();

    return useMutation({
        mutationFn: async ({
            sesion,
            ejerciciosIds
        }: {
            sesion: Omit<Sesion, 'id' | 'coach_id' | 'created_at' | 'updated_at'>;
            ejerciciosIds?: string[]
        }) => {
            if (!coach?.id) throw new Error('Usuario no autenticado');

            // 1. Insert session
            const { data: newSession, error: sessionError } = await supabase
                .from('sesiones')
                .insert([{ ...sesion, coach_id: coach.id }])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Insert associated exercises if any
            if (ejerciciosIds && ejerciciosIds.length > 0) {
                const sessionExercises: SesionEjercicioInsert[] = ejerciciosIds.map((id_ejercicio, index) => ({
                    id_sesion: newSession.id,
                    id_ejercicio,
                    orden: index + 1
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
        },
    });
}

// Update session and its set of exercises
export function useUpdateSesion() {
    const queryClient = useQueryClient();
    const { coach } = useAuth();

    return useMutation({
        mutationFn: async ({
            id,
            updates,
            ejerciciosIds
        }: {
            id: string;
            updates: Partial<Sesion>;
            ejerciciosIds?: string[]
        }) => {
            if (!coach?.id) throw new Error('Usuario no autenticado');

            // 1. Update session basic data
            const { data: updatedSession, error: sessionError } = await supabase
                .from('sesiones')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Update exercises association if provided
            if (ejerciciosIds !== undefined) {
                // Delete previous associations
                const { error: deleteError } = await supabase
                    .from('sesiones_ejercicios')
                    .delete()
                    .eq('id_sesion', id);

                if (deleteError) throw deleteError;

                // Insert new ones
                if (ejerciciosIds.length > 0) {
                    const sessionExercises: SesionEjercicioInsert[] = ejerciciosIds.map((id_ejercicio, index) => ({
                        id_sesion: id,
                        id_ejercicio,
                        orden: index + 1
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
        },
    });
}

// Delete session
export function useDeleteSesion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
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
            }
        },
    });
}
