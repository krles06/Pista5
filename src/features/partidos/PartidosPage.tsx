import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trophy, Calendar, MoreVertical, Trash2, Home, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { usePartidos, useDeletePartido } from '@/hooks/usePartidos';
import { useTemporadas } from '@/hooks/useTemporadas';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function PartidosPage() {
    const navigate = useNavigate();
    const [selectedTemporada, setSelectedTemporada] = useState<string>('all');
    const { data: temporadas } = useTemporadas();
    const { data: partidos, isLoading } = usePartidos(selectedTemporada === 'all' ? undefined : selectedTemporada);
    const deleteMutation = useDeletePartido();

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Informe de partido eliminado');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-50 flex items-center gap-3 italic">
                        <Trophy className="h-10 w-10 text-emerald-500 not-italic" />
                        INFORMES DE PARTIDOS
                    </h1>
                    <p className="text-zinc-500 font-medium">Gestiona los resultados y alineaciones de la temporada.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedTemporada} onValueChange={setSelectedTemporada}>
                        <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800 text-zinc-300">
                            <SelectValue placeholder="Todas las temporadas" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                            <SelectItem value="all">Todas las temporadas</SelectItem>
                            {temporadas?.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.temporada}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => navigate('/partidos/nuevo')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 shadow-lg shadow-emerald-900/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        NUEVO INFORME
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            ) : !partidos || partidos.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900/50 shadow-xl border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-20 w-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-zinc-700/50">
                            <Trophy className="h-10 w-10 text-zinc-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-200">No hay informes todavía</h3>
                        <p className="text-zinc-500 mt-2 mb-8 max-w-sm">
                            Registra el primer partido para empezar a analizar el rendimiento del equipo.
                        </p>
                        <Button
                            onClick={() => navigate('/partidos/nuevo')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12"
                        >
                            Crear primer informe
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {partidos.map((partido) => {
                        const isWin = (partido.condicion === 'local' && (partido.goles_local || 0) > (partido.goles_visitante || 0)) ||
                            (partido.condicion === 'visitante' && (partido.goles_visitante || 0) > (partido.goles_local || 0));
                        const isDraw = (partido.goles_local || 0) === (partido.goles_visitante || 0);

                        return (
                            <Card key={partido.id} className="border-zinc-800 bg-zinc-900 hover:border-emerald-500/50 transition-all shadow-xl group overflow-hidden">
                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                {format(new Date(partido.fecha), "PPP", { locale: es })}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className={`text-[10px] h-5 font-bold uppercase ${isWin ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : isDraw ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {isWin ? 'Victoria' : isDraw ? 'Empate' : 'Derrota'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-4 px-2 bg-zinc-950/40 rounded-2xl border border-zinc-800/50 mb-4">
                                        <div className="flex-1 text-center flex flex-col items-center gap-1 min-w-0">
                                            <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center mb-1">
                                                <Home className={`h-4 w-4 ${partido.condicion === 'local' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                                            </div>
                                            <span className="text-xs font-black text-zinc-100 truncate w-full uppercase">
                                                {partido.condicion === 'local' ? 'Nosotros' : partido.rival}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-black text-zinc-50">{partido.goles_local || 0}</span>
                                            <span className="text-zinc-700 font-black">-</span>
                                            <span className="text-3xl font-black text-zinc-50">{partido.goles_visitante || 0}</span>
                                        </div>

                                        <div className="flex-1 text-center flex flex-col items-center gap-1 min-w-0">
                                            <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center mb-1">
                                                <ExternalLink className={`h-4 w-4 ${partido.condicion === 'visitante' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                                            </div>
                                            <span className="text-xs font-black text-zinc-100 truncate w-full uppercase">
                                                {partido.condicion === 'visitante' ? 'Nosotros' : partido.rival}
                                            </span>
                                        </div>
                                    </div>

                                    {partido.notas_tacticas && (
                                        <p className="text-sm text-zinc-500 line-clamp-2 italic mb-6">
                                            "{partido.notas_tacticas}"
                                        </p>
                                    )}

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 uppercase p-0.5 px-2 text-[9px] font-black">{partido.tipo_partido}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[10px] font-black tracking-widest text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-8"
                                                onClick={() => navigate(`/partidos/${partido.id}/editar`)}
                                            >
                                                EDITAR
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-50 rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl">
                                                    <DropdownMenuItem onClick={() => navigate(`/partidos/${partido.id}`)} className="cursor-pointer">
                                                        Ver detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(partido.id)}
                                                        className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">¿Eliminar informe de partido?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Esta acción no se puede deshacer. Se eliminarán permanentemente el resultado y la alineación asociada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">Eliminar permanentemente</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
