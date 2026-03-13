import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Coach } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    coach: Coach | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Coach>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    coach: null,
    session: null,
    loading: true,
    signOut: async () => { },
    updateProfile: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [coach, setCoach] = useState<Coach | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchCoachProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchCoachProfile(session.user.id);
            } else {
                setCoach(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchCoachProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('coaches')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching coach profile:', error);
            } else {
                setCoach(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updateProfile = async (updates: Partial<Coach>) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('coaches')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        if (data) setCoach(data);
    };

    return (
        <AuthContext.Provider value={{ user, coach, session, loading, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
