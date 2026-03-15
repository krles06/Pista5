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
        enabled: !!session,
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
        enabled: !!id && !!session,
    });
}

// Create new season
export function useCreateTemporada() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTemporada: Omit<Temporada, 'id' | 'coach_id' | 'created_at'>) => {
            const userId = await getAuthenticatedUserId();

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
            await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('temporadas')
                .update(updates)
                .eq('id', id)
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
            await getAuthenticatedUserId();
            const { error } = await supabase
                .from('temporadas')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['temporadas'] });
        },
    });
}
