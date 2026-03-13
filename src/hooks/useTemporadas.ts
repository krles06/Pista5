import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Temporada } from '@/lib/types';
import { useAuth } from './useAuth';

// Fetch all seasons for the current coach
export function useTemporadas() {
    const { coach } = useAuth();

    return useQuery({
        queryKey: ['temporadas', coach?.id],
        queryFn: async () => {
            if (!coach?.id) return [];

            const { data, error } = await supabase
                .from('temporadas')
                .select('*')
                .eq('coach_id', coach.id)
                .order('fecha_inicio', { ascending: false });

            if (error) throw error;
            return data as Temporada[];
        },
        enabled: !!coach?.id,
    });
}

// Fetch a single season by ID
export function useTemporada(id?: string) {
    const { coach } = useAuth();

    return useQuery({
        queryKey: ['temporadas', id],
        queryFn: async () => {
            if (!id || !coach?.id) return null;

            const { data, error } = await supabase
                .from('temporadas')
                .select('*')
                .eq('id', id)
                .eq('coach_id', coach.id)
                .single();

            if (error) throw error;
            return data as Temporada;
        },
        enabled: !!id && !!coach?.id,
    });
}

// Create new season
export function useCreateTemporada() {
    const queryClient = useQueryClient();
    const { coach } = useAuth();

    return useMutation({
        mutationFn: async (newTemporada: Omit<Temporada, 'id' | 'coach_id' | 'created_at'>) => {
            if (!coach?.id) throw new Error('Usuario no autenticado');

            const { data, error } = await supabase
                .from('temporadas')
                .insert([{ ...newTemporada, coach_id: coach.id }])
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
