import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import type { Macrociclo, Mesociclo, Microciclo } from '@/lib/types-planificacion';
import { useAuth } from './useAuth';

// --- MACROCICLOS ---

export function useMacrociclos(temporadaId?: string) {
    const { session } = useAuth();
    return useQuery({
        queryKey: ['macrociclos', temporadaId, session?.user?.id],
        queryFn: async () => {
            if (!temporadaId) return [];
            await getAuthenticatedUserId(); // ensure auth
            const { data, error } = await supabase
                .from('macrociclos')
                .select('*')
                .eq('id_temporada', temporadaId)
                .order('fecha_inicio', { ascending: true });
            if (error) throw error;
            return data as Macrociclo[];
        },
        enabled: !!temporadaId && !!session?.user?.id,
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
    const { session } = useAuth();
    return useQuery({
        queryKey: ['mesociclos', macrocicloId, session?.user?.id],
        queryFn: async () => {
            if (!macrocicloId) return [];
            await getAuthenticatedUserId(); // ensure auth
            const { data, error } = await supabase
                .from('mesociclos')
                .select('*')
                .eq('id_macrociclo', macrocicloId)
                .order('fecha_inicio', { ascending: true });
            if (error) throw error;
            return data as Mesociclo[];
        },
        enabled: !!macrocicloId && !!session?.user?.id,
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
    const { session } = useAuth();
    return useQuery({
        queryKey: ['microciclos', mesocicloId, session?.user?.id],
        queryFn: async () => {
            if (!mesocicloId) return [];
            await getAuthenticatedUserId(); // ensure auth
            const { data, error } = await supabase
                .from('microciclos')
                .select('*')
                .eq('id_mesociclo', mesocicloId)
                .order('fecha_inicio', { ascending: true });
            if (error) throw error;
            return data as Microciclo[];
        },
        enabled: !!mesocicloId && !!session?.user?.id,
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
export function useMicrociclo(id?: string) {
    const { session } = useAuth();
    return useQuery({
        queryKey: ['microciclo', id],
        queryFn: async () => {
            if (!id) return null;
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('microciclos')
                .select('*')
                .eq('id', id)
                .eq('coach_id', userId)
                .single();
            if (error) throw error;
            return data as Microciclo;
        },
        enabled: !!id && !!session?.user?.id,
    });
}
export function useActiveMicrociclo() {
    const { session } = useAuth();
    return useQuery({
        queryKey: ['activeMicrociclo', session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();
            const now = new Date();
            const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            
            console.log('--- DEBUG DASHBOARD DATA ---');
            console.log('Today:', today);

            // 1. Check all Microcycles for the coach
            const { data: allMicros } = await supabase
                .from('microciclos')
                .select('*')
                .eq('coach_id', userId);
            console.log('Microcycles in DB for this coach:', allMicros);

            // 2. Check all Seasons for the coach
            const { data: allSeasons } = await supabase
                .from('temporadas')
                .select('*')
                .eq('coach_id', userId);
            console.log('Seasons in DB for this coach:', allSeasons);

            // 3. Check for ANY sessions this week
            const { data: weekSessions } = await supabase
                .from('sesiones')
                .select('*')
                .eq('coach_id', userId)
                .gte('fecha', '2026-03-16')
                .lte('fecha', '2026-03-22');
            console.log('Sessions this week (Mar 16-22):', weekSessions);

            // Original logic for active micro
            const active = allMicros?.find(m => m.fecha_inicio <= today && m.fecha_fin >= today);
            console.log('Active Micro Found:', active);

            return active as any;
        },
        enabled: !!session?.user?.id,
    });
}
