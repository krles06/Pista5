import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Por favor, indica tu email');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // Redirige al dashboard o página de cambio de contraseña
                redirectTo: `${window.location.origin}/actualizar-password`,
            });

            if (error) throw error;

            setSent(true);
            toast.success('Correo de recuperación enviado');
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar el correo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="bg-emerald-600 h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white italic text-2xl shadow-lg shadow-emerald-900/20 mb-4">
                        P5
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Pista5</h1>
                    <p className="text-muted-foreground font-medium">Recuperar contraseña</p>
                </div>

                <Card className="border-border bg-card shadow-xl">
                    {!sent ? (
                        <form onSubmit={handleReset}>
                            <CardHeader>
                                <CardTitle className="text-xl text-foreground">¿Problemas para acceder?</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground">Email registrado</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="entrenador@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-emerald-500"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                </Button>
                                <div className="text-sm text-center">
                                    <Link to="/login" className="flex items-center justify-center text-muted-foreground hover:text-foreground">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver al login
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle className="text-xl text-emerald-500 text-center">¡Correo enviado!</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-muted-foreground space-y-4">
                                <p>
                                    Si existe una cuenta asociada a <strong>{email}</strong>, hemos enviado un enlace para restablecer la contraseña.
                                </p>
                                <p className="text-sm">
                                    Por favor, revisa tu bandeja de entrada y la carpeta de spam.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    className="w-full border-border bg-muted text-foreground hover:bg-muted/80 hover:text-foreground"
                                    onClick={() => navigate('/login')}
                                >
                                    Volver al inicio de sesión
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
