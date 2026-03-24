import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [team, setTeam] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !name) {
            toast.error('Por favor, rellena los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            // 1. Sign up in Supabase Auth with metadata for the profile
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre: name,
                        equipo: team || null
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user && !data.session) {
                // Email confirmation required
                sessionStorage.setItem('pending_verification_email', email);
                navigate('/verificar-email');
            } else if (data.session) {
                // Send welcome email (fire-and-forget)
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bienvenida-email`, {
                    method: 'POST',
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${data.session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nombre: name }),
                }).catch(() => {/* non-critical */});
                toast.success('Registro completado con éxito');
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error durante el registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />

            <div className="w-full max-w-md space-y-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-emerald-600/10 p-3 rounded-2xl mb-1 border border-emerald-500/10 shadow-2xl shadow-emerald-500/5">
                        <Activity className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Pista5</h1>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Unirse a la élite</p>
                    </div>
                </div>

                <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleRegister}>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-foreground font-bold tracking-tight">Registro</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Gestiona tus planificaciones profesionalmente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Nombre completo *</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Carles..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Email de contacto *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu-nombre@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Contraseña *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Seguridad avanzada"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                    disabled={loading}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="team" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Club actual (Opcional)</Label>
                                <Input
                                    id="team"
                                    placeholder="Ej: Sala 5 Martorell"
                                    value={team}
                                    onChange={(e) => setTeam(e.target.value)}
                                    className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                                    disabled={loading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? 'Creando perfil...' : 'Comenzar ahora'}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="font-bold text-foreground hover:text-emerald-500 transition-colors underline underline-offset-4 decoration-emerald-500/20">
                                    Inicia sesión
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <div className="flex flex-col items-center gap-4 py-4">
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
