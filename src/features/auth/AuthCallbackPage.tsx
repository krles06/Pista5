import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // onAuthStateChange fires when Supabase processes the URL hash token
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/actualizar-password', { replace: true });
            } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
                navigate('/dashboard', { replace: true });
            }
        });

        // Fallback: if event already fired before this component mounted
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/dashboard', { replace: true });
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                <p className="text-muted-foreground text-sm">Iniciando sesión...</p>
            </div>
        </div>
    );
}
