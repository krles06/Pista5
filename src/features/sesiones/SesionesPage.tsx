import { useNavigate, useParams } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar, MapPin, ChevronRight, ArrowLeft, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSesiones, useDeleteSesion } from '@/hooks/useSesiones';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { Microciclo } from '@/lib/types-planificacion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function SesionesPage() {
    const { id_microciclo } = useParams<{ id_microciclo: string }>();
    const navigate = useNavigate();
    const { coach } = useAuth();
    const { data: sesiones, isLoading: loadingSessions } = useSesiones(id_microciclo);
    const deleteMutation = useDeleteSesion();

    const [microciclo, setMicrociclo] = useState<Microciclo | null>(null);
    const [loadingMicro, setLoadingMicro] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    useEffect(() => {
        async function fetchMicrociclo() {
            if (!id_microciclo || !coach?.id) return;
            setLoadingMicro(true);
            const { data, error } = await supabase
                .from('microciclos')
                .select('*')
                .eq('id', id_microciclo)
                .eq('coach_id', coach.id)
                .single();

            if (!error && data) {
                setMicrociclo(data as Microciclo);
            }
            setLoadingMicro(false);
        }
        fetchMicrociclo();
    }, [id_microciclo, coach?.id]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Sesión eliminada');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setDeleteId(null);
        }
    };

    if (loadingSessions || loadingMicro) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                        <span>Temporada</span>
                        <ChevronRight className="h-3 w-3" />
                        <span>Microciclo</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-zinc-400">{microciclo?.nombre}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                        Sesiones de Entrenamiento
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg mr-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 h-8 text-xs ${viewMode === 'calendar' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'}`}
                            onClick={() => setViewMode('calendar')}
                        >
                            Calendario
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 h-8 text-xs ${viewMode === 'list' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'}`}
                            onClick={() => setViewMode('list')}
                        >
                            Lista
                        </Button>
                    </div>
                    <Button
                        onClick={() => navigate(`/sesiones/nueva?microciclo=${id_microciclo}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Sesión
                    </Button>
                </div>
            </div>

            {microciclo && (
                <Card className="border-zinc-800 bg-zinc-900/50 shadow-none">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            <span>{format(new Date(microciclo.fecha_inicio), "dd/MM/yyyy")} — {format(new Date(microciclo.fecha_fin), "dd/MM/yyyy")}</span>
                        </div>
                        {microciclo.tipo && <Badge variant="outline" className="w-fit">{microciclo.tipo}</Badge>}
                    </CardContent>
                </Card>
            )}

            {(!sesiones || sesiones.length === 0) && viewMode === 'list' ? (
                <Card className="border-zinc-800 bg-zinc-900 shadow-xl border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-medium text-zinc-200">No hay sesiones en este microciclo</h3>
                        <p className="text-zinc-400 mt-2 mb-6 max-w-sm">
                            Empieza a planificar tus entrenamientos añadiendo la primera sesión.
                        </p>
                        <Button
                            onClick={() => navigate(`/sesiones/nueva?microciclo=${id_microciclo}`)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Crear sesión
                        </Button>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' ? (
                <div className="grid gap-4">
                    {sesiones?.map((sesion) => (
                        <Card key={sesion.id} className="border-zinc-800 bg-zinc-900 hover:border-emerald-500/50 transition-colors shadow-lg overflow-hidden group">
                            <div className="flex items-center p-4">
                                <div className="h-12 w-12 rounded-xl bg-zinc-800 flex flex-col items-center justify-center border border-zinc-700 shrink-0">
                                    <span className="text-[10px] uppercase text-zinc-500 font-bold leading-none">{format(new Date(sesion.fecha), "MMM", { locale: es })}</span>
                                    <span className="text-lg font-bold text-zinc-200 leading-none mt-1">{format(new Date(sesion.fecha), "d")}</span>
                                </div>

                                <div className="ml-4 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">{format(new Date(sesion.fecha), "EEEE", { locale: es })}</span>
                                        {sesion.lugar && (
                                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {sesion.lugar}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-100 truncate">
                                        {sesion.objetivos || "Sesión de entrenamiento"}
                                    </h3>
                                    {sesion.material && (
                                        <p className="text-xs text-zinc-500 truncate mt-1">
                                            Material: {sesion.material}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="hidden sm:flex border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                                        onClick={() => navigate(`/sesiones/${sesion.id}/ver`)}
                                    >
                                        Ver detalles
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-50">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                            <DropdownMenuItem onClick={() => navigate(`/sesiones/${sesion.id}/editar`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(sesion.id)}
                                                className="text-red-500 focus:text-red-600 focus:bg-red-500/10"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/50">
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                            <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-r last:border-r-0 border-zinc-800">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-7 min-h-[400px]">
                        {Array.from({ length: 7 }).map((_, i) => {
                            if (!microciclo) return <div key={i} className="min-h-[120px] bg-zinc-950/20 border-r border-b border-zinc-800" />;

                            // Align to the Monday of the week where the microciclo starts
                            const monday = startOfWeek(new Date(microciclo.fecha_inicio), { weekStartsOn: 1 });
                            const dayDate = addDays(monday, i);

                            const daySessions = sesiones?.filter(s =>
                                isSameDay(new Date(s.fecha), dayDate)
                            ) || [];

                            const isToday = isSameDay(new Date(), dayDate);
                            const isWithinMicrociclo = dayDate >= new Date(microciclo!.fecha_inicio) && dayDate <= new Date(microciclo!.fecha_fin);

                            return (
                                <div
                                    key={i}
                                    className={`group min-h-[120px] sm:min-h-[220px] border-r border-b last:border-r-0 border-zinc-800 p-3 flex flex-col gap-2 transition-all ${!isWithinMicrociclo ? 'bg-zinc-950/40' : 'bg-transparent hover:bg-zinc-900/40'
                                        } ${isToday ? 'bg-emerald-500/[0.02]' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black ${isToday ? 'text-emerald-500' : isWithinMicrociclo ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                                {format(dayDate, 'd')}
                                            </span>
                                            <span className="text-[8px] uppercase tracking-tighter text-zinc-600 sm:hidden">
                                                {format(dayDate, 'EEEE', { locale: es })}
                                            </span>
                                        </div>
                                        {isWithinMicrociclo && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-zinc-700 hover:text-emerald-500 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-md"
                                                onClick={() => navigate(`/sesiones/nueva?microciclo=${id_microciclo}&fecha=${format(dayDate, 'yyyy-MM-dd')}`)}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 mt-1">
                                        {daySessions.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => navigate(`/sesiones/${s.id}/ver`)}
                                                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/10 cursor-pointer transition-all group/sesion relative overflow-hidden"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/40" />
                                                <p className="text-[10px] font-bold text-zinc-100 leading-tight line-clamp-2">
                                                    {s.objetivos || 'Sesión'}
                                                </p>
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 opacity-0 group-hover/sesion:opacity-100 transition-all">
                                                    <span className="text-[8px] text-zinc-500 font-medium">VER</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/sesiones/${s.id}/editar`); }}
                                                        className="text-[8px] font-bold text-emerald-500 hover:text-emerald-400"
                                                    >
                                                        EDITAR
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Sesión?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos de esta sesión.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
