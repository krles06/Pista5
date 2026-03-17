import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search, LayoutGrid, List as ListIcon, Trash2, Edit } from 'lucide-react';

import { useEjercicios, useDeleteEjercicio } from '@/hooks/useEjercicios';
import type { Ejercicio } from '@/lib/types-ejercicios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TIPO_TAREA,
    TRABAJO,
    DIFICULTAD,
} from '@/lib/constants';
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

interface EjerciciosPageProps {
    esPorteros?: boolean;
}

export default function EjerciciosPage({ esPorteros = false }: EjerciciosPageProps) {
    const navigate = useNavigate();
    const { data: ejercicios, isLoading } = useEjercicios(esPorteros);
    const deleteMutation = useDeleteEjercicio();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipoTarea, setFilterTipoTarea] = useState('all');
    const [filterTrabajo, setFilterTrabajo] = useState('all');
    const [filterDificultad, setFilterDificultad] = useState('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Ejercicio eliminado');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setDeleteId(null);
        }
    };

    const filteredEjercicios = ejercicios?.filter(ej => {
        const matchesSearch = ej.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ej.objetivo_principal?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTipoTarea = filterTipoTarea === 'all' || ej.tipo_tarea === filterTipoTarea;
        const matchesTrabajo = filterTrabajo === 'all' || ej.trabajo === filterTrabajo;
        const matchesDificultad = filterDificultad === 'all' || ej.dificultad === filterDificultad;

        return matchesSearch && matchesTipoTarea && matchesTrabajo && matchesDificultad;
    });

    const getBaseRoute = () => esPorteros ? '/porteros' : '/ejercicios';

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {esPorteros ? 'Ejercicios de Porteros' : 'Mis Ejercicios'}
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona tus ejercicios, diseña tareas y asigmálas a las sesiones.
                    </p>
                </div>
                <Button
                    onClick={() => navigate(`${getBaseRoute()}/nuevo`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Ejercicio
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar título..."
                            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground w-full h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={filterTipoTarea} onValueChange={setFilterTipoTarea}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-card border-border text-foreground h-10">
                            <SelectValue placeholder="Tipo Tarea" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="all">Todas las tareas</SelectItem>
                            {TIPO_TAREA.map((item) => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterTrabajo} onValueChange={setFilterTrabajo}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-card border-border text-foreground h-10">
                            <SelectValue placeholder="Trabajo" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="all">Todo el trabajo</SelectItem>
                            {TRABAJO.map((item) => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterDificultad} onValueChange={setFilterDificultad}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-card border-border text-foreground h-10">
                            <SelectValue placeholder="Dificultad" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="all">Dificultad</SelectItem>
                            {DIFICULTAD.map((item) => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg h-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`px-3 h-full ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`px-3 h-full ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
            ) : !filteredEjercicios || filteredEjercicios.length === 0 ? (
                <Card className="border-border bg-card shadow-xl border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">No hay ejercicios aún</h3>
                        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                            Crea tu primer ejercicio para empezar a construir tu base de datos de tareas de entrenamiento.
                        </p>
                        <Button onClick={() => navigate(`${getBaseRoute()}/nuevo`)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Crear ejercicio
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEjercicios.map((ej) => (
                                <EjercicioCard
                                    key={ej.id}
                                    ejercicio={ej}
                                    baseRoute={getBaseRoute()}
                                    onDelete={() => setDeleteId(ej.id)}
                                    onEdit={() => navigate(`${getBaseRoute()}/${ej.id}/editar`)}
                                    onClick={() => navigate(`${getBaseRoute()}/${ej.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground bg-background uppercase border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Ejercicio</th>
                                            <th className="px-6 py-4 font-medium">Etapa</th>
                                            <th className="px-6 py-4 font-medium">Duración / Jugadores</th>
                                            <th className="px-6 py-4 font-medium">Categoría</th>
                                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {filteredEjercicios.map((ej) => (
                                            <tr key={ej.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`${getBaseRoute()}/${ej.id}`)}>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{ej.titulo}</div>
                                                    {ej.objetivo_principal && <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[300px]">{ej.objetivo_principal}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10 font-normal">
                                                        {ej.etapa_sesion}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                                    <div className="flex flex-col gap-1">
                                                        {ej.duracion_minutos && <span>⏱️ {ej.duracion_minutos} min</span>}
                                                        {ej.n_jugadores && <span>👥 {ej.n_jugadores} jug.</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {ej.tipo_tarea && <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px]">{ej.tipo_tarea}</Badge>}
                                                        {ej.trabajo && <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px]">{ej.trabajo}</Badge>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => navigate(`${getBaseRoute()}/${ej.id}/editar`)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => setDeleteId(ej.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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

// Subcomponent for Grid View
function EjercicioCard({
    ejercicio,
    onDelete,
    onEdit,
    onClick
}: {
    ejercicio: Ejercicio;
    baseRoute: string;
    onDelete: () => void;
    onEdit: () => void;
    onClick: () => void;
}) {
    return (
        <Card
            className="border-border bg-card shadow-xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col h-full"
            onClick={onClick}
        >
            <div className="aspect-video w-full bg-background relative overflow-hidden border-b border-border">
                {ejercicio.url_imagen || ejercicio.fichero_imagen ? (
                    <img
                        src={ejercicio.url_imagen || ejercicio.fichero_imagen || ''}
                        alt={ejercicio.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                    </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-background/60 backdrop-blur-md text-emerald-400 border border-emerald-500/20 font-medium">
                        {ejercicio.etapa_sesion}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2 flex-grow">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-foreground line-clamp-1">{ejercicio.titulo}</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="sr-only">Open menu</span>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.12132 8.625 12.5 8.625C11.87868 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.87868 6.375 12.5 6.375C13.12132 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {ejercicio.objetivo_principal && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {ejercicio.objetivo_principal}
                    </p>
                )}
            </CardHeader>

            <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex flex-col gap-3">
                <div className="flex flex-wrap gap-1">
                    {ejercicio.tipo_tarea && (
                        <Badge variant="secondary" className="bg-background text-muted-foreground border-border font-normal py-0">
                            {ejercicio.tipo_tarea}
                        </Badge>
                    )}
                    {ejercicio.trabajo && (
                        <Badge variant="secondary" className="bg-background text-muted-foreground border-border font-normal py-0">
                            {ejercicio.trabajo}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex items-center gap-3">
                        {ejercicio.n_jugadores && (
                            <span>👥 {ejercicio.n_jugadores}</span>
                        )}
                        {ejercicio.duracion_minutos && (
                            <span>⏱️ {ejercicio.duracion_minutos}'</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
