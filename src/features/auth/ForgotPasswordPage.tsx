import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="bg-emerald-600/20 p-3 rounded-2xl mb-2 flex items-center justify-center">
                        <Activity className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Recuperar contraseña</h1>
                </div>

                <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                    {!sent ? (
                        <form onSubmit={handleReset}>
                            <CardHeader>
                                <CardTitle className="text-xl text-zinc-50">¿Problemas para acceder?</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-300">Email registrado</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="entrenador@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
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
                                    <Link to="/login" className="flex items-center justify-center text-zinc-400 hover:text-zinc-300">
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
                            <CardContent className="text-center text-zinc-400 space-y-4">
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
                                    className="w-full border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50"
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
