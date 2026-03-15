import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import type { Ejercicio } from '@/lib/types-ejercicios';
import { useAuth } from './useAuth';

// Feth all exercises (filtered by es_portero)
export function useEjercicios(esPortero: boolean = false) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['ejercicios', esPortero, session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('ejercicios')
                .select('*')
                .eq('coach_id', userId)
                .eq('es_portero', esPortero)
                .order('titulo', { ascending: true });

            if (error) throw error;
            return data as Ejercicio[];
        },
        enabled: !!session,
    });
}

// Fetch single exercise
export function useEjercicio(id?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['ejercicio', id],
        queryFn: async () => {
            if (!id) return null;
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('ejercicios')
                .select('*')
                .eq('id', id)
                .eq('coach_id', userId)
                .single();

            if (error) throw error;
            return data as Ejercicio;
        },
        enabled: !!id && !!session,
    });
}

// Upload image helper
const uploadImage = async (file: File, coachId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${coachId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('ejercicios-imagenes')
        .upload(fileName, file);

    if (uploadError) throw new Error('Error al subir la imagen: ' + uploadError.message);

    const { data } = supabase.storage
        .from('ejercicios-imagenes')
        .getPublicUrl(fileName);

    return data.publicUrl;
};

// Create exercise
export function useCreateEjercicio() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ejercicio,
            imageFile
        }: {
            ejercicio: Omit<Ejercicio, 'id' | 'coach_id' | 'created_at' | 'updated_at'>;
            imageFile?: File
        }) => {
            const userId = await getAuthenticatedUserId();

            let url_imagen = ejercicio.url_imagen;

            if (imageFile) {
                url_imagen = await uploadImage(imageFile, userId);
            }

            const { data, error } = await supabase
                .from('ejercicios')
                .insert([{ ...ejercicio, coach_id: userId, url_imagen }])
                .select()
                .single();

            if (error) throw error;
            return data as Ejercicio;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ejercicios', variables.ejercicio.es_portero] });
        },
    });
}

// Update exercise
export function useUpdateEjercicio() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            updates,
            imageFile
        }: {
            id: string;
            updates: Partial<Ejercicio>;
            imageFile?: File
        }) => {
            const userId = await getAuthenticatedUserId();

            let url_imagen = updates.url_imagen;

            if (imageFile) {
                url_imagen = await uploadImage(imageFile, userId);
            }

            const { data, error } = await supabase
                .from('ejercicios')
                .update({ ...updates, url_imagen, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Ejercicio;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ejercicios', data.es_portero] });
            queryClient.invalidateQueries({ queryKey: ['ejercicio', data.id] });
        },
    });
}

// Delete exercise
export function useDeleteEjercicio() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            // Opcional: Eliminar la imagen del storage si existe (requiere extraer el path de la URL pública)
            const { data, error } = await supabase
                .from('ejercicios')
                .delete()
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Ejercicio;
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['ejercicios', data.es_portero] });
            }
        },
    });
}
