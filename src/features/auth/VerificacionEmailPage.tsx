import { Link } from 'react-router-dom';
import { Activity, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VerificacionEmailPage() {
    const [resending, setResending] = useState(false);
    const email = sessionStorage.getItem('pending_verification_email') || '';

    const handleResend = async () => {
        if (!email) return;
        try {
            setResending(true);
            const { error } = await supabase.auth.resend({ type: 'signup', email });
            if (error) throw error;
            toast.success('Email reenviado. Revisa tu bandeja de entrada.');
        } catch {
            toast.error('No se pudo reenviar el email. Inténtalo de nuevo.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />

            <div className="w-full max-w-md text-center space-y-8 relative z-10">
                <div className="flex justify-center">
                    <div className="bg-emerald-600/10 p-4 rounded-2xl border border-emerald-500/10 shadow-2xl shadow-emerald-500/5">
                        <Activity className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Mail className="h-8 w-8 text-emerald-500" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black tracking-tight italic uppercase text-foreground">
                            Verifica tu email
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Hemos enviado un enlace de verificación a
                            {email && <span className="block font-bold text-foreground mt-1">{email}</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Haz clic en el enlace del email para activar tu cuenta. Revisa también la carpeta de spam.
                        </p>
                    </div>

                    {email && (
                        <Button
                            variant="outline"
                            className="border-border w-full"
                            onClick={handleResend}
                            disabled={resending}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                            {resending ? 'Enviando...' : 'Reenviar email'}
                        </Button>
                    )}

                    <div className="pt-4 border-t border-border text-sm text-muted-foreground">
                        ¿Ya verificaste?{' '}
                        <Link to="/login" className="font-bold text-foreground hover:text-emerald-500 transition-colors underline underline-offset-4 decoration-emerald-500/20">
                            Inicia sesión
                        </Link>
                    </div>
                </div>

                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
                    © {new Date().getFullYear()} Pista5 Performance System
                </p>
            </div>
        </div>
    );
}
