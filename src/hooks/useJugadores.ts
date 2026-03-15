import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/utils';
import type { Jugador, JugadorInsert, JugadorUpdate } from '@/lib/types-jugadores';
import { useAuth } from './useAuth';

// Upload photo helper
const uploadPhoto = async (file: File, coachId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${coachId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('jugadores-fotos')
        .upload(fileName, file);

    if (uploadError) throw new Error('Error al subir la foto: ' + uploadError.message);

    const { data } = supabase.storage
        .from('jugadores-fotos')
        .getPublicUrl(fileName);

    return data.publicUrl;
};

// Fetch all players for a coach, optionally filtered by season
export function useJugadores(temporadaId?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['jugadores', temporadaId, session?.user?.id],
        queryFn: async () => {
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('jugadores')
                .select('*')
                .eq('coach_id', userId)
                .order('nombre', { ascending: true });

            if (error) throw error;

            const allPlayers = data as Jugador[];

            // If no temporadaId is provided (e.g. initial state or global list), return all
            if (!temporadaId || temporadaId === 'all') {
                return allPlayers;
            }

            // Filter: show players of that season OR players with no season assigned
            return allPlayers.filter(j =>
                j.id_temporada === temporadaId ||
                j.id_temporada === null ||
                j.id_temporada === '' ||
                !(j as any).id_temporada
            );
        },
        enabled: !!session,
    });
}

// Fetch single player
export function useJugador(id?: string) {
    const { session } = useAuth();

    return useQuery({
        queryKey: ['jugador', id],
        queryFn: async () => {
            if (!id) return null;
            const userId = await getAuthenticatedUserId();

            const { data, error } = await supabase
                .from('jugadores')
                .select('*')
                .eq('id', id)
                .eq('coach_id', userId)
                .single();

            if (error) throw error;
            return data as Jugador;
        },
        enabled: !!id && !!session,
    });
}

// Create player
export function useCreateJugador() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            jugador,
            photoFile
        }: {
            jugador: JugadorInsert;
            photoFile?: File
        }) => {
            const userId = await getAuthenticatedUserId();

            let url_foto = null;
            if (photoFile) {
                url_foto = await uploadPhoto(photoFile, userId);
            }

            const { data, error } = await supabase
                .from('jugadores')
                .insert([{ ...jugador, coach_id: userId, url_foto }])
                .select()
                .single();

            if (error) throw error;
            return data as Jugador;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jugadores'] });
        },
    });
}

// Update player
export function useUpdateJugador() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            updates,
            photoFile
        }: {
            id: string;
            updates: JugadorUpdate;
            photoFile?: File
        }) => {
            const userId = await getAuthenticatedUserId();

            let url_foto = (updates as any).url_foto;

            if (photoFile) {
                url_foto = await uploadPhoto(photoFile, userId);
            }

            const { data, error } = await supabase
                .from('jugadores')
                .update({ ...updates, url_foto, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Jugador;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['jugadores'] });
            queryClient.invalidateQueries({ queryKey: ['jugador', data.id] });
        },
    });
}

// Delete player
export function useDeleteJugador() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await getAuthenticatedUserId();
            const { data, error } = await supabase
                .from('jugadores')
                .delete()
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Jugador;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jugadores'] });
        },
    });
}
