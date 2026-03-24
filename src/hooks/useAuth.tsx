import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
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

    const fetchCoachProfile = useCallback(async (userId: string, isRetry = false) => {
        try {
            const { data, error } = await supabase
                .from('coaches')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                setLoading(false);
            } else if (!data && !isRetry) {
                // Retry once after 1.5s if profile not found (race condition with trigger)
                setTimeout(() => fetchCoachProfile(userId, true), 1500);
            } else {
                setCoach(data);
                setLoading(false);
            }
        } catch (e) {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Init: get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                fetchCoachProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen: handle auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const newUser = session?.user ?? null;
            setUser(newUser);

            if (newUser) {
                // Only fetch if user ID changed or coach is not loaded
                fetchCoachProfile(newUser.id);
            } else {
                setCoach(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchCoachProfile]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const updateProfile = useCallback(async (updates: Partial<Coach>) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('coaches')
            .upsert({ id: user.id, ...updates })
            .select()
            .maybeSingle();

        if (error) throw error;
        if (data) setCoach(data);
    }, [user]);

    const value = useMemo(() => ({
        user,
        coach,
        session,
        loading,
        signOut,
        updateProfile
    }), [user, coach, session, loading, signOut, updateProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
