import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import type { Temporada } from '@/lib/types';
import { useAuth } from './useAuth';

// Fetch all seasons for the current coach
export function useTemporadas() {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['temporadas', session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('temporadas')
                .select('*')
                .eq('coach_id', userId)
                .order('fecha_inicio', { ascending: false });

            if (error) throw error;
            return data as Temporada[];
        },
        enabled: !!session?.user?.id,
    });
}

// Fetch a single season by ID
export function useTemporada(id?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['temporada', id],
        queryFn: async () => {
            if (!id) return null;
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('temporadas')
                .select('*')
                .eq('id', id)
                .eq('coach_id', userId)
                .single();

            if (error) throw error;
            return data as Temporada;
        },
        enabled: !!id && !!session?.user?.id,
    });
}

// Create new season
export function useCreateTemporada() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTemporada: Omit<Temporada, 'id' | 'coach_id' | 'created_at'>) => {
            const userId = await getAuthenticatedUserId();

            // Check if there is already an active season for today
            const today = new Date().toISOString().split('T')[0];
            const { data: existingSeasons, error: checkError } = await supabase
                .from('temporadas')
                .select('id')
                .eq('coach_id', userId)
                .lte('fecha_inicio', today)
                .gte('fecha_fin', today);

            if (checkError) throw checkError;
            if (existingSeasons && existingSeasons.length > 0) {
                throw new Error('Ya tienes una temporada activa para las fechas de hoy. No puedes crear otra solapada.');
            }

            const { data, error } = await supabase
                .from('temporadas')
                .insert([{ ...newTemporada, coach_id: userId }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['temporadas'] });
        },
    });
}

// Update existing season
export function useUpdateTemporada() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Temporada> }) => {
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('temporadas')
                .update(updates)
                .eq('id', id)
                .eq('coach_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['temporadas'] });
            queryClient.invalidateQueries({ queryKey: ['temporadas', variables.id] });
        },
    });
}

// Delete season
export function useDeleteTemporada() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const userId = await getAuthenticatedUserId();
            const { error } = await supabase
                .from('temporadas')
                .delete()
                .eq('id', id)
                .eq('coach_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['temporadas'] });
        },
    });
}
