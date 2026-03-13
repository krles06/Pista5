import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { user, coach, updateProfile } = useAuth();

    const [name, setName] = useState('');
    const [team, setTeam] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coach) {
            setName(coach.nombre || '');
            setTeam(coach.equipo || '');
        }
    }, [coach]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('El nombre no puede estar vacío');
            return;
        }

        try {
            setLoading(true);
            await updateProfile({
                nombre: name,
                equipo: team,
            });
            toast.success('Perfil actualizado correctamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!user || !coach) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Mi Perfil</h1>
                <p className="text-zinc-400">Gestiona tu información personal y configuración de cuenta.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900 shadow-xl md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-500" />
                                Información Personal
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Actualiza tus datos de entrenador.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-zinc-300">Nombre completo</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team" className="text-zinc-300">Equipo actual</Label>
                                    <Input
                                        id="team"
                                        value={team}
                                        onChange={(e) => setTeam(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                                        placeholder="Ej: Sala 5 Martorell"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-zinc-800">
                                <Label className="text-zinc-300 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email de acceso (Solo lectura)
                                </Label>
                                <Input
                                    value={user.email}
                                    className="bg-zinc-950/50 border-zinc-800 text-zinc-500 cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-xs text-zinc-500">Para cambiar tu email debes contactar con soporte.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-zinc-800 pt-6">
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900 shadow-xl md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 text-zinc-50">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            Seguridad
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Gestiona tu contraseña.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50">
                            Cambiar contraseña
                        </Button>
                        <p className="mt-2 text-xs text-zinc-500">Se enviará un enlace de recuperación a tu email.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
