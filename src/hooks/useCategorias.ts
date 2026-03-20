import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import { useAuth } from './useAuth';

export interface Categoria {
    id: string;
    coach_id: string;
    campo: string;
    valor: string;
    created_at: string;
}

export function useCategorias(campo?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['categorias', campo, session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();
            let query = supabase
                .from('categorias_ejercicio')
                .select('*')
                .eq('coach_id', userId);

            if (campo) {
                query = query.eq('campo', campo);
            }

            const { data, error } = await query.order('valor', { ascending: true });

            if (error) throw error;
            return data as Categoria[];
        },
        enabled: !!session?.user?.id,
    });
}

export function useCreateCategoria() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ campo, valor }: { campo: string; valor: string }) => {
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('categorias_ejercicio')
                .insert([{ coach_id: userId, campo, valor }])
                .select()
                .single();

            if (error) throw error;
            return data as Categoria;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['categorias', variables.campo] });
            queryClient.invalidateQueries({ queryKey: ['categorias', undefined] });
        },
    });
}

export function useDeleteCategoria() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            const { error } = await supabase
                .from('categorias_ejercicio')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
}
