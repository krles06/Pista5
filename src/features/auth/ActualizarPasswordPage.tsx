import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function ActualizarPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase puts the session in the URL hash after redirect
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (password !== confirm) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast.success('Contraseña actualizada correctamente');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Verificando enlace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />

            <div className="w-full max-w-md space-y-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="mb-1">
                        <img src="/P5-LogoS.png" alt="Pista5" className="h-16 w-16 rounded-2xl shadow-2xl shadow-emerald-500/10" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Pista5</h1>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Nueva contraseña</p>
                    </div>
                </div>

                <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold tracking-tight">Actualizar contraseña</CardTitle>
                            <CardDescription>Introduce tu nueva contraseña.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Nueva contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/40 border-border h-11 focus-visible:ring-emerald-500/50"
                                    minLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Confirmar contraseña</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="bg-background/40 border-border h-11 focus-visible:ring-emerald-500/50"
                                    minLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="pb-8">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
