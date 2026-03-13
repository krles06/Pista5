import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    User,
    Phone,
    Mail,
    Edit,
    Trash2,
    ShieldAlert,
    LayoutGrid,
    List as ListIcon,
    ArrowLeft
} from 'lucide-react';

import { useJugadores, useDeleteJugador } from '@/hooks/useJugadores';
import { useTemporada } from '@/hooks/useTemporadas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function JugadoresPage() {
    const { id_temporada } = useParams<{ id_temporada: string }>();
    const navigate = useNavigate();
    const { data: jugadores, isLoading } = useJugadores(id_temporada);
    const { data: temporada } = useTemporada(id_temporada);
    const deleteMutation = useDeleteJugador();

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Jugador eliminado');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setDeleteId(null);
        }
    };

    const filteredJugadores = jugadores?.filter(j =>
        `${j.nombre} ${j.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.posicion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    {id_temporada && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/temporadas/${id_temporada}`)}
                            className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-50 shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                            {temporada ? `Plantilla: ${temporada.equipo}` : 'Plantilla de Jugadores'}
                        </h1>
                        <p className="text-zinc-400">
                            {temporada ? `Temporada ${temporada.temporada}` : 'Gestiona los perfiles, posiciones y estado físico de tus jugadores.'}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(`/jugadores/nuevo${id_temporada ? `?temporada=${id_temporada}` : ''}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Jugador
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar por nombre o posición..."
                        className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`px-3 py-1.5 h-auto ${viewMode === 'grid' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-300'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`px-3 py-1.5 h-auto ${viewMode === 'list' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-300'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            ) : !filteredJugadores || filteredJugadores.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900 shadow-xl border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                            <User className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium text-zinc-200">No hay jugadores</h3>
                        <p className="text-zinc-400 mt-2 mb-6 max-w-sm">
                            Empieza a añadir jugadores a tu base de datos para incorporarlos a tus equipos y sesiones.
                        </p>
                        <Button onClick={() => navigate('/jugadores/nuevo')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Crear primer jugador
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredJugadores.map((j) => (
                                <Card
                                    key={j.id}
                                    className={`border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col h-full`}
                                    onClick={() => navigate(`/jugadores/${j.id}`)}
                                >
                                    <CardHeader className="p-5 flex flex-row items-center gap-4 space-y-0">
                                        <Avatar className="h-14 w-14 border-2 border-zinc-800">
                                            <AvatarImage src={j.url_foto || ''} className="object-cover" />
                                            <AvatarFallback className="bg-zinc-950 text-emerald-500 font-bold text-lg">
                                                {j.nombre[0]}{j.apellidos?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-zinc-50 truncate leading-tight">
                                                {j.nombre} {j.apellidos}
                                            </h3>
                                            <p className="text-xs text-zinc-500 mt-0.5 truncate uppercase tracking-wider font-medium">
                                                {j.posicion || 'Sin posición'}
                                            </p>
                                        </div>
                                        <Badge className="bg-zinc-950 border-zinc-800 text-zinc-400 font-bold h-7 min-w-[28px] justify-center">
                                            {j.dorsal || '--'}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between gap-4">
                                        <div className="space-y-2">
                                            {j.lesionado && (
                                                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/5 p-2 rounded border border-red-500/10">
                                                    <ShieldAlert className="h-3 w-3" />
                                                    En camilla / Lesionado
                                                </div>
                                            )}
                                            {!j.lesionado && <div className="h-8" />} {/* Spacer */}
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                                            <div className="flex gap-2">
                                                {j.telefono && <Phone className="h-3 w-3 text-zinc-600" />}
                                                {j.email && <Mail className="h-3 w-3 text-zinc-600" />}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-50" onClick={(e) => { e.stopPropagation(); navigate(`/jugadores/${j.id}/editar`); }}>
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteId(j.id); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-400 bg-zinc-950 uppercase border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Nombre</th>
                                        <th className="px-6 py-4 font-medium">Posición</th>
                                        <th className="px-6 py-4 font-medium text-center">Dorsal</th>
                                        <th className="px-6 py-4 font-medium">Estado</th>
                                        <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {filteredJugadores.map((j) => (
                                        <tr key={j.id} className="hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/jugadores/${j.id}`)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border border-zinc-800">
                                                        <AvatarImage src={j.url_foto || ''} />
                                                        <AvatarFallback className="text-[10px] bg-zinc-950 text-emerald-500">
                                                            {j.nombre[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium text-zinc-100">{j.nombre} {j.apellidos}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">{j.posicion || '--'}</td>
                                            <td className="px-6 py-4 text-center font-bold text-emerald-500">{j.dorsal || '--'}</td>
                                            <td className="px-6 py-4">
                                                {j.lesionado ? (
                                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-normal">Lesionado</Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Disponible</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-50" onClick={() => navigate(`/jugadores/${j.id}/editar`)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400" onClick={() => setDeleteId(j.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Jugador?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Esta acción eliminará permanentemente al jugador de tu base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-50">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
