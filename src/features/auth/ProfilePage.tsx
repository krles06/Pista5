import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield } from 'lucide-react';
import { getAuthenticatedUserId } from '@/lib/utils';

export default function ProfilePage() {
    const { user, coach, loading, updateProfile } = useAuth();

    const [name, setName] = useState('');
    const [team, setTeam] = useState('');
    const [updating, setUpdating] = useState(false);

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
            setUpdating(true);
            const userId = await getAuthenticatedUserId();
            await updateProfile({
                id: userId,
                nombre: name,
                equipo: team,
            });
            toast.success('Perfil actualizado correctamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el perfil');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center p-12 text-muted-foreground font-black italic uppercase tracking-widest">
                Debes iniciar sesión para ver esta página
            </div>
        );
    }

    const isMissingProfile = !coach;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {isMissingProfile ? 'Completar Perfil' : 'Mi Perfil'}
                </h1>
                <p className="text-muted-foreground">
                    {isMissingProfile 
                        ? 'Parece que aún no has completado tu información de entrenador.' 
                        : 'Gestiona tu información personal y configuración de cuenta.'}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border bg-card shadow-xl md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-500" />
                                Información Personal
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Actualiza tus datos de entrenador.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-foreground">Nombre completo</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-background border-border focus-visible:ring-emerald-500"
                                        disabled={updating}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team" className="text-foreground">Equipo actual</Label>
                                    <Input
                                        id="team"
                                        value={team}
                                        onChange={(e) => setTeam(e.target.value)}
                                        className="bg-background border-border focus-visible:ring-emerald-500"
                                        placeholder="Ej: Sala 5 Martorell"
                                        disabled={updating}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-border">
                                <Label className="text-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email de acceso (Solo lectura)
                                </Label>
                                <Input
                                    value={user?.email || ''}
                                    className="bg-background/50 border-border text-muted-foreground cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Para cambiar tu email debes contactar con soporte.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-border pt-6">
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={updating}
                            >
                                {updating ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="border-border bg-card shadow-xl md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            Seguridad
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Gestiona tu contraseña.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="border-border bg-muted text-foreground hover:bg-muted/80 hover:text-foreground">
                            Cambiar contraseña
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground">Se enviará un enlace de recuperación a tu email.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
