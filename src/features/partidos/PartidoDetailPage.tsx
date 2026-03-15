import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Calendar, Home, ExternalLink, Users, ClipboardList, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { usePartido, useDeletePartido } from '@/hooks/usePartidos';
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

export default function PartidoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: partido, isLoading, error } = usePartido(id);
    const deleteMutation = useDeletePartido();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !partido) {
        return (
            <div className="max-w-4xl mx-auto p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                Error al cargar el partido. Puede que no exista o no tengas permisos.
                <Button onClick={() => navigate('/partidos')} variant="link" className="ml-4 text-emerald-500">
                    Volver a partidos
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(partido.id);
            toast.success('Partido eliminado correctamente');
            navigate('/partidos');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setIsDeleteOpen(false);
        }
    };

    const isWin = (partido.condicion === 'local' && (partido.goles_local || 0) > (partido.goles_visitante || 0)) ||
        (partido.condicion === 'visitante' && (partido.goles_visitante || 0) > (partido.goles_local || 0));
    const isDraw = (partido.goles_local || 0) === (partido.goles_visitante || 0);

    const titulares = partido.alineacion?.filter(a => a.es_titular) || [];
    const suplentes = partido.alineacion?.filter(a => !a.es_titular) || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate('/partidos')}
                        className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 shrink-0 mt-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={`uppercase tracking-widest text-[10px] font-black ${isWin ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : isDraw ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {isWin ? 'Victoria' : isDraw ? 'Empate' : 'Derrota'}
                            </Badge>
                            {partido.tipo_partido && (
                                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 uppercase tracking-widest text-[10px]">
                                    {partido.tipo_partido}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 leading-tight">
                            vs {partido.rival || 'Sin rival'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-zinc-400">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                                {format(new Date(partido.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        className="border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                        onClick={() => navigate(`/partidos/${partido.id}/editar`)}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/50"
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Scoreboard */}
            <Card className="border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden rounded-2xl">
                <div className="p-8 flex items-center justify-center gap-8 bg-gradient-to-b from-zinc-900 to-zinc-950">
                    <div className="flex-1 text-center flex flex-col items-center gap-2">
                        <div className="h-14 w-14 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700/30">
                            <Home className={`h-7 w-7 ${partido.condicion === 'local' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                        </div>
                        <span className="text-sm font-black text-zinc-100 uppercase tracking-wider">
                            {partido.condicion === 'local' ? 'Nosotros' : (partido.rival || 'Rival')}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Local</span>
                    </div>

                    <div className="flex items-center gap-4 px-6">
                        <span className="text-6xl font-black text-zinc-50">{partido.goles_local ?? 0}</span>
                        <span className="text-2xl text-zinc-700 font-black">—</span>
                        <span className="text-6xl font-black text-zinc-50">{partido.goles_visitante ?? 0}</span>
                    </div>

                    <div className="flex-1 text-center flex flex-col items-center gap-2">
                        <div className="h-14 w-14 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700/30">
                            <ExternalLink className={`h-7 w-7 ${partido.condicion === 'visitante' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                        </div>
                        <span className="text-sm font-black text-zinc-100 uppercase tracking-wider">
                            {partido.condicion === 'visitante' ? 'Nosotros' : (partido.rival || 'Rival')}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Visitante</span>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Titulares */}
                <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                    <CardHeader className="pb-3 border-b border-zinc-800/50">
                        <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                            <Users className="h-5 w-5 text-emerald-500" />
                            Titulares ({titulares.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {titulares.length === 0 ? (
                            <p className="text-zinc-600 italic text-sm py-4 text-center">No hay titulares registrados</p>
                        ) : (
                            <div className="space-y-2">
                                {titulares.map((jugador) => (
                                    <div key={jugador.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                <span className="text-xs font-bold text-emerald-500">
                                                    {jugador.jugador?.posicion?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-zinc-100">
                                                    {jugador.jugador?.nombre || 'Jugador desconocido'}
                                                </span>
                                                <span className="text-xs text-zinc-500 ml-2">{jugador.jugador?.posicion}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500">{jugador.minutos_jugados}'</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Suplentes */}
                <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                    <CardHeader className="pb-3 border-b border-zinc-800/50">
                        <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                            <Users className="h-5 w-5 text-zinc-500" />
                            Suplentes ({suplentes.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {suplentes.length === 0 ? (
                            <p className="text-zinc-600 italic text-sm py-4 text-center">No hay suplentes registrados</p>
                        ) : (
                            <div className="space-y-2">
                                {suplentes.map((jugador) => (
                                    <div key={jugador.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                                <span className="text-xs font-bold text-zinc-500">
                                                    {jugador.jugador?.posicion?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-zinc-100">
                                                    {jugador.jugador?.nombre || 'Jugador desconocido'}
                                                </span>
                                                <span className="text-xs text-zinc-500 ml-2">{jugador.jugador?.posicion}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500">{jugador.minutos_jugados}'</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Notas tácticas */}
            <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                        <ClipboardList className="h-5 w-5 text-emerald-500" />
                        Notas Tácticas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {partido.notas_tacticas ? (
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {partido.notas_tacticas}
                        </p>
                    ) : (
                        <p className="text-zinc-600 italic text-sm py-4 text-center">
                            No se añadieron notas tácticas para este partido.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">¿Eliminar informe de partido?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Esta acción no se puede deshacer. Se eliminarán permanentemente el resultado y la alineación asociada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-50 rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
