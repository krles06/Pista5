import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import type { Macrociclo, Mesociclo, Microciclo } from '@/lib/types-planificacion';
import { useAuth } from './useAuth';

// --- MACROCICLOS ---

export function useMacrociclos(temporadaId?: string) {
    const { coach } = useAuth();
    return useQuery({
        queryKey: ['macrociclos', temporadaId],
        queryFn: async () => {
            if (!temporadaId || !coach?.id) return [];
            const { data, error } = await supabase
                .from('macrociclos')
                .select('*')
                .eq('id_temporada', temporadaId)
                .order('fecha_inicio', { ascending: true });
            if (error) throw error;
            return data as Macrociclo[];
        },
        enabled: !!temporadaId && !!coach?.id,
    });
}

export function useCreateMacrociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (nuevo: Omit<Macrociclo, 'id' | 'coach_id' | 'created_at'>) => {
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('macrociclos')
                .insert([{ ...nuevo, coach_id: userId }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['macrociclos', variables.id_temporada] });
        },
    });
}

export function useUpdateMacrociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Macrociclo> }) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase.from('macrociclos').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data as Macrociclo;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['macrociclos', data.id_temporada] });
        },
    });
}

export function useDeleteMacrociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase.from('macrociclos').delete().eq('id', id).select().single();
            if (error) throw error;
            return data as Macrociclo;
        },
        onSuccess: (data) => {
            if (data) queryClient.invalidateQueries({ queryKey: ['macrociclos', data.id_temporada] });
        },
    });
}

// --- MESOCICLOS ---

export function useMesociclos(macrocicloId?: string) {
    const { coach } = useAuth();
    return useQuery({
        queryKey: ['mesociclos', macrocicloId],
        queryFn: async () => {
            if (!macrocicloId || !coach?.id) return [];
            const { data, error } = await supabase
                .from('mesociclos')
                .select('*')
                .eq('id_macrociclo', macrocicloId)
                .order('fecha_inicio', { ascending: true });
            if (error) throw error;
            return data as Mesociclo[];
        },
        enabled: !!macrocicloId && !!coach?.id,
    });
}

export function useCreateMesociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (nuevo: Omit<Mesociclo, 'id' | 'coach_id' | 'created_at'>) => {
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('mesociclos')
                .insert([{ ...nuevo, coach_id: userId }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['mesociclos', variables.id_macrociclo] });
        },
    });
}

export function useUpdateMesociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Mesociclo> }) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase.from('mesociclos').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data as Mesociclo;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['mesociclos', data.id_macrociclo] });
        },
    });
}

export function useDeleteMesociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase.from('mesociclos').delete().eq('id', id).select().single();
            if (error) throw error;
            return data as Mesociclo;
        },
        onSuccess: (data) => {
            if (data) queryClient.invalidateQueries({ queryKey: ['mesociclos', data.id_macrociclo] });
        },
    });
}

// --- MICROCICLOS ---

export function useMicrociclos(mesocicloId?: string) {
    const { coach } = useAuth();
    return useQuery({
        queryKey: ['microciclos', mesocicloId],
        queryFn: async () => {
            if (!mesocicloId || !coach?.id) return [];
            const { data, error } = await supabase
                .from('microciclos')
                .select('*')
                .eq('id_mesociclo', mesocicloId)
                .order('fecha_inicio', { ascending: true });
            if (error) throw error;
            return data as Microciclo[];
        },
        enabled: !!mesocicloId && !!coach?.id,
    });
}

export function useCreateMicrociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (nuevo: Omit<Microciclo, 'id' | 'coach_id' | 'created_at'>) => {
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('microciclos')
                .insert([{ ...nuevo, coach_id: userId }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['microciclos', variables.id_mesociclo] });
        },
    });
}

export function useUpdateMicrociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Microciclo> }) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase.from('microciclos').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data as Microciclo;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['microciclos', data.id_mesociclo] });
        },
    });
}

export function useDeleteMicrociclo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase.from('microciclos').delete().eq('id', id).select().single();
            if (error) throw error;
            return data as Microciclo;
        },
        onSuccess: (data) => {
            if (data) queryClient.invalidateQueries({ queryKey: ['microciclos', data.id_mesociclo] });
        },
    });
}
