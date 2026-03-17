import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Por favor, rellena todos los campos');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            toast.success('Inicio de sesión correcto');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-emerald-600/10 p-4 rounded-3xl mb-1 border border-emerald-500/10 shadow-2xl shadow-emerald-500/5">
                        <Activity className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Pista5</h1>
                        <p className="text-sm text-muted-foreground font-medium">Elevando el rendimiento del fútbol sala</p>
                    </div>
                </div>

                <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleLogin}>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-foreground font-bold tracking-tight">Bienvenido</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Introduce tus credenciales para acceder al panel
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Contraseña</Label>
                                    <Link to="/recuperar-password" title="¿Olvidaste tu contraseña?" className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                                        ¿La has olvidado?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                ¿Nuevo en Pista5?{' '}
                                <Link to="/registro" className="font-bold text-foreground hover:text-emerald-500 transition-colors underline underline-offset-4 decoration-emerald-500/20">
                                    Crea una cuenta gratis
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-center text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
                        © {new Date().getFullYear()} Pista5 Performance System
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        <Link to="/contacto" className="hover:text-emerald-500 transition-colors">Contacto</Link>
                        <Link to="/terminos" className="hover:text-emerald-500 transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
