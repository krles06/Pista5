import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Users, Maximize2, Map, LayoutGrid, Target, Play, Edit, Trash2 } from 'lucide-react';

import { useEjercicio, useDeleteEjercicio } from '@/hooks/useEjercicios';
import { StorageImage } from '@/components/ui/storage-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export default function EjercicioDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: ejercicio, isLoading, error } = useEjercicio(id);
    const deleteMutation = useDeleteEjercicio();

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !ejercicio) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                Error al cargar el ejercicio. Puede que no exista o no tengas permisos.
                <Button onClick={() => navigate('/ejercicios')} variant="link" className="ml-4 text-emerald-500">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(ejercicio.id);
            toast.success('Ejercicio eliminado correctamente');
            navigate(ejercicio.es_portero ? '/porteros' : '/ejercicios');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    const basePath = ejercicio.es_portero ? '/porteros' : '/ejercicios';

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(basePath)}
                        className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 mt-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[10px]">
                                {ejercicio.etapa_sesion}
                            </Badge>
                            {ejercicio.es_portero && (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-widest text-[10px]">
                                    Porteros
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                            {ejercicio.titulo}
                        </h1>
                        {ejercicio.objetivo_principal && (
                            <p className="text-muted-foreground text-lg mt-2 font-medium">
                                {ejercicio.objetivo_principal}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        className="border-border bg-card text-foreground hover:bg-muted"
                        onClick={() => navigate(`${basePath}/${ejercicio.id}/editar`)}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/50"
                        onClick={() => setIsDeleteAlertOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">

                {/* Left Column (Image & Main Data) */}
                <div className="lg:col-span-2 space-y-6 shrink-0">

                    <Card className="border-border bg-card shadow-xl overflow-hidden rounded-2xl">
                        {ejercicio.url_imagen || ejercicio.fichero_imagen ? (
                            <StorageImage
                                path={ejercicio.url_imagen || ejercicio.fichero_imagen}
                                bucket="ejercicios-imagenes"
                                alt={ejercicio.titulo}
                                className="w-full aspect-video object-contain bg-background"
                            />
                        ) : (
                            <div className="w-full aspect-video bg-background flex flex-col items-center justify-center text-muted-foreground border-b border-border/50">
                                <LayoutGrid className="h-16 w-16 mb-4 opacity-50" />
                                <p>Sin imagen representativa</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-muted">
                            <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                                <Clock className="h-5 w-5 text-emerald-500 mb-1" />
                                <span className="text-xs text-muted-foreground uppercase font-medium">Duración</span>
                                <span className="text-lg font-bold text-foreground">{ejercicio.duracion_minutos ? `${ejercicio.duracion_minutos}'` : '--'}</span>
                            </div>
                            <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                                <Users className="h-5 w-5 text-emerald-500 mb-1" />
                                <span className="text-xs text-muted-foreground uppercase font-medium">Jugadores</span>
                                <span className="text-lg font-bold text-foreground">{ejercicio.n_jugadores || '--'}</span>
                            </div>
                            <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                                <Maximize2 className="h-5 w-5 text-emerald-500 mb-1" />
                                <span className="text-xs text-muted-foreground uppercase font-medium">Dimensiones</span>
                                <span className="text-lg font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full px-2" title={ejercicio.dimensiones || '--'}>
                                    {ejercicio.dimensiones || '--'}
                                </span>
                            </div>
                            <div className="bg-card p-4 flex flex-col items-center justify-center text-center">
                                <Map className="h-5 w-5 text-emerald-500 mb-1" />
                                <span className="text-xs text-muted-foreground uppercase font-medium">Material</span>
                                <span className="text-xs font-medium text-foreground line-clamp-2 px-1">
                                    {ejercicio.material || '--'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-border bg-card shadow-xl overflow-hidden rounded-2xl">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-lg text-foreground">Categorización y Análisis</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DetailItem label="Tipo de Tarea" value={ejercicio.tipo_tarea} />
                                <DetailItem label="Tipo de Trabajo" value={ejercicio.tipo_trabajo} />
                                <DetailItem label="Trabajo Específico" value={ejercicio.trabajo} />
                                <DetailItem label="Componente" value={ejercicio.componente_juego} />
                                <DetailItem label="Sistema" value={ejercicio.sistema_juego} />
                                <DetailItem label="Dificultad" value={ejercicio.dificultad} />
                                <DetailItem label="Físico Integrado" value={ejercicio.trabajo_fisico_integrado} />
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column (Text descriptions) */}
                <div className="space-y-6">
                    <Card className="border-border bg-card shadow-xl h-full flex flex-col">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                <Target className="h-5 w-5 text-emerald-500" />
                                Desarrollo del Ejercicio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6 flex-1 text-sm text-foreground">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 uppercase text-xs tracking-wider">Descripción</h3>
                                {ejercicio.descripcion ? (
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {ejercicio.descripcion}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground italic">No hay descripción añadida.</p>
                                )}
                            </div>

                            {ejercicio.reglas && (
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2 uppercase text-xs tracking-wider">Reglas / Consignas</h3>
                                    <div className="bg-background p-4 rounded-lg border border-border">
                                        <p className="whitespace-pre-wrap leading-relaxed text-emerald-100/80">
                                            {ejercicio.reglas}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {ejercicio.url_video && (
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2 uppercase text-xs tracking-wider">Animación / Video</h3>
                                    <a
                                        href={ejercicio.url_video}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    >
                                        <Play className="h-4 w-4" />
                                        <span className="font-medium">Ver Vídeo del Ejercicio</span>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="bg-card border-border text-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Ejercicio?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Esta acción no se puede deshacer. El ejercicio se eliminará permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted text-foreground border-border hover:bg-muted hover:text-foreground">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-foreground">
                {value || <span className="text-muted-foreground font-normal italic">No especificado</span>}
            </span>
        </div>
    );
}
