import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTemporada, useUpdateTemporada, useTemporada } from '@/hooks/useTemporadas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

export default function TemporadaForm() {
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const navigate = useNavigate();
    const { coach } = useAuth();

    const { data: temporada, isLoading: isFetching } = useTemporada(id);
    const createMutation = useCreateTemporada();
    const updateMutation = useUpdateTemporada();

    const [formData, setFormData] = useState({
        temporada: '',
        equipo: '',
        categoria: '',
        fecha_inicio: '',
        fecha_fin: '',
        objetivos: '',
        entrenador: '',
    });

    useEffect(() => {
        // Si estamos editando y ya tenemos los datos, poblamos el formulario
        if (isEditing && temporada) {
            setFormData({
                temporada: temporada.temporada || '',
                equipo: temporada.equipo || '',
                categoria: temporada.categoria || '',
                fecha_inicio: temporada.fecha_inicio ? temporada.fecha_inicio.split('T')[0] : '',
                fecha_fin: temporada.fecha_fin ? temporada.fecha_fin.split('T')[0] : '',
                objetivos: temporada.objetivos || '',
                entrenador: temporada.entrenador || '',
            });
        } else if (!isEditing && coach) {
            // Valor por defecto en creación
            setFormData(prev => ({
                ...prev,
                equipo: coach.equipo || '',
                entrenador: coach.nombre || '',
                temporada: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
            }));
        }
    }, [isEditing, temporada, coach]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación de fechas
        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        try {
            if (isEditing && id) {
                await updateMutation.mutateAsync({ id, updates: formData });
                toast.success('Temporada actualizada correctamente');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Temporada creada correctamente');
            }
            navigate('/temporadas');
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message);
        }
    };

    if (isEditing && isFetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/temporadas')}
                    className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar Temporada' : 'Nueva Temporada'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? 'Modifica los datos generales de la temporada.' : 'Configura una nueva temporada deportiva.'}
                    </p>
                </div>
            </div>

            <Card className="border-border bg-card shadow-xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-xl text-foreground">Datos Generales</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Información básica para identificar esta planificación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="temporada" className="text-foreground">Nombre temporada *</Label>
                                <Input
                                    id="temporada"
                                    name="temporada"
                                    placeholder="Ej: 2025/2026 o Apertura 2025"
                                    value={formData.temporada}
                                    onChange={handleChange}
                                    className="bg-background border-border text-foreground focus-visible:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="equipo" className="text-foreground">Equipo *</Label>
                                <Input
                                    id="equipo"
                                    name="equipo"
                                    placeholder="Ej: Sala 5 Martorell"
                                    value={formData.equipo}
                                    onChange={handleChange}
                                    className="bg-background border-border text-foreground focus-visible:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoria" className="text-foreground">Categoría (Opcional)</Label>
                                <Input
                                    id="categoria"
                                    name="categoria"
                                    placeholder="Ej: Senior, Juvenil A..."
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className="bg-background border-border text-foreground focus-visible:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entrenador" className="text-foreground">Entrenador Principal (Opcional)</Label>
                                <Input
                                    id="entrenador"
                                    name="entrenador"
                                    value={formData.entrenador}
                                    onChange={handleChange}
                                    className="bg-background border-border text-foreground focus-visible:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-4 md:col-span-2 border-t border-border pt-6 mt-2">
                                <h3 className="text-sm font-medium text-foreground">Duración y Objetivos</h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fecha_inicio" className="text-foreground">Fecha de inicio *</Label>
                                        <Input
                                            id="fecha_inicio"
                                            name="fecha_inicio"
                                            type="date"
                                            value={formData.fecha_inicio}
                                            onChange={handleChange}
                                            className="bg-background border-border text-foreground focus-visible:ring-emerald-500 [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fecha_fin" className="text-foreground">Fecha de fin *</Label>
                                        <Input
                                            id="fecha_fin"
                                            name="fecha_fin"
                                            type="date"
                                            value={formData.fecha_fin}
                                            onChange={handleChange}
                                            className="bg-background border-border text-foreground focus-visible:ring-emerald-500 [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="objetivos" className="text-foreground">Objetivos generales (Opcional)</Label>
                                <Textarea
                                    id="objetivos"
                                    name="objetivos"
                                    placeholder="Resume los objetivos físicos, tácticos y competitivos para esta temporada..."
                                    value={formData.objetivos}
                                    onChange={handleChange}
                                    className="min-h-[120px] bg-background border-border text-foreground focus-visible:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/temporadas')}
                                className="border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                        Guardando...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditing ? 'Guardar Cambios' : 'Crear Temporada'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
