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
        enabled: !!session?.user?.id,
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
        enabled: !!id && !!session?.user?.id,
    });
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_MB = 5;

// Upload image helper — returns the storage path (not a public URL)
const uploadImage = async (file: File, coachId: string): Promise<string> => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.');
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        throw new Error(`La imagen no puede superar ${MAX_IMAGE_SIZE_MB} MB.`);
    }
    const ext = file.type.split('/')[1];
    const fileName = `${coachId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('ejercicios-imagenes')
        .upload(fileName, file, { contentType: file.type });

    if (uploadError) throw new Error('Error al subir la imagen: ' + uploadError.message);

    return fileName;
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

            const dataToInsert = {
                ...ejercicio,
                coach_id: userId,
            };

            if (url_imagen) {
                dataToInsert.url_imagen = url_imagen;
                (dataToInsert as any).fichero_imagen = url_imagen;
            }

            const { data, error } = await supabase
                .from('ejercicios')
                .insert([dataToInsert])
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

            const dataToUpdate: any = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            if (url_imagen !== undefined) {
                dataToUpdate.url_imagen = url_imagen;
                dataToUpdate.fichero_imagen = url_imagen;
            }

            const { data, error } = await supabase
                .from('ejercicios')
                .update(dataToUpdate)
                .eq('id', id)
                .eq('coach_id', userId)
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
            const userId = await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('ejercicios')
                .delete()
                .eq('id', id)
                .eq('coach_id', userId)
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
