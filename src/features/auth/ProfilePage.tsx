import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Tags, Trash2 } from 'lucide-react';
import { getAuthenticatedUserId } from '@/lib/utils';
import { useCategorias, useDeleteCategoria } from '@/hooks/useCategorias';
import { Badge } from '@/components/ui/badge';

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
                            <Tags className="h-5 w-5 text-emerald-500" />
                            Categorías Personalizadas
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Gestiona tus etiquetas personalizadas para los ejercicios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoriesManager />
                    </CardContent>
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
function CategoriesManager() {
    const { data: allCategories, isLoading } = useCategorias();
    const deleteMutation = useDeleteCategoria();

    if (isLoading) return <div className="p-4 text-center text-muted-foreground animate-pulse">Cargando categorías...</div>;
    if (!allCategories || allCategories.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">No tienes categorías personalizadas aún.</p>
                <p className="text-xs text-muted-foreground mt-1">Puedes crearlas directamente desde el formulario de nuevo ejercicio.</p>
            </div>
        );
    }

    // Group by campo
    const grouped = allCategories.reduce((acc, cat) => {
        if (!acc[cat.campo]) acc[cat.campo] = [];
        acc[cat.campo].push(cat);
        return acc;
    }, {} as Record<string, typeof allCategories>);

    const campoLabels: Record<string, string> = {
        tipo_tarea: 'Tipo de Tarea',
        tipo_trabajo: 'Tipo de Trabajo',
        trabajo: 'Trabajo Específico',
        componente_juego: 'Componente Juego',
        sistema_juego: 'Sistema Juego',
        dificultad: 'Dificultad',
        trabajo_fisico_integrado: 'Físico Integrado'
    };

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(grouped).map(([campo, cats]) => (
                <div key={campo} className="space-y-3 p-4 bg-muted/50 rounded-2xl border border-border">
                    <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase flex items-center justify-between">
                        {campoLabels[campo] || campo}
                        <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/20 text-emerald-500">
                            {cats.length}
                        </Badge>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {cats.map((cat) => (
                            <div 
                                key={cat.id} 
                                className="group flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-lg transition-all hover:scale-105"
                            >
                                <span className="text-sm font-medium text-foreground">{cat.valor}</span>
                                <button
                                    onClick={() => deleteMutation.mutate(cat.id)}
                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
