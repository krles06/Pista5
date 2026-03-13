import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, MoreVertical, Plus, Trash2, Edit } from 'lucide-react';
import { useTemporadas, useDeleteTemporada } from '@/hooks/useTemporadas';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function TemporadasPage() {
    const navigate = useNavigate();
    const { data: temporadas, isLoading, error } = useTemporadas();
    const deleteMutation = useDeleteTemporada();

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Temporada eliminada correctamente');
        } catch (err: any) {
            toast.error('Error al eliminar: ' + err.message);
        } finally {
            setDeleteId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                Error al cargar las temporadas. Por favor, recarga la página.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Temporadas</h1>
                    <p className="text-zinc-400">Gestiona tus temporadas y equipos.</p>
                </div>
                <Button
                    onClick={() => navigate('/temporadas/nueva')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Temporada
                </Button>
            </div>

            {!temporadas || temporadas.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900 shadow-xl border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <CalendarIcon className="h-12 w-12 text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-200">Ninguna temporada creada</h3>
                        <p className="text-zinc-400 mt-1 mb-4">Empieza creando tu primera temporada para planificar entrenamientos.</p>
                        <Button onClick={() => navigate('/temporadas/nueva')} variant="outline" className="border-zinc-700 text-zinc-300">
                            Crear temporada
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {temporadas.map((temp) => {
                        const startDate = new Date(temp.fecha_inicio);
                        const endDate = new Date(temp.fecha_fin);
                        const isActive = new Date() >= startDate && new Date() <= endDate;

                        return (
                            <Card
                                key={temp.id}
                                className={`border-zinc-800 bg-zinc-900 shadow-xl hover:border-emerald-500/50 transition-colors flex flex-col ${isActive ? 'ring-1 ring-emerald-500/50' : ''
                                    }`}
                            >
                                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl text-zinc-50 leading-tight">
                                            {temp.temporada}
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            {temp.equipo} {temp.categoria && `- ${temp.categoria}`}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-zinc-400 hover:text-zinc-100">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                            <DropdownMenuItem onClick={() => navigate(`/temporadas/${temp.id}/editar`)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Editar</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(temp.id)}
                                                className="text-red-500 focus:text-red-600 focus:bg-red-500/10"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Eliminar</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="pb-4 flex-1 text-sm text-zinc-300 space-y-2">
                                    <div className="flex items-center text-zinc-400">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <span>
                                            {format(startDate, "d MMM yyyy", { locale: es })} - {format(endDate, "d MMM yyyy", { locale: es })}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-emerald-500/10 text-emerald-500">
                                            Temporada actual
                                        </div>
                                    )}
                                    {temp.objetivos && (
                                        <p className="text-zinc-500 line-clamp-2 mt-2 text-xs">
                                            {temp.objetivos}
                                        </p>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-zinc-800/50">
                                    <Button
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                                        variant="secondary"
                                        onClick={() => navigate(`/temporadas/${temp.id}`)}
                                    >
                                        Ver planificación
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Esta acción no se puede deshacer. Se eliminará esta temporada y
                            <strong className="text-red-400"> todas las planificaciones, sesiones y datos de jugadores </strong>
                            vinculados a ella.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-50">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Eliminar Temporada
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
