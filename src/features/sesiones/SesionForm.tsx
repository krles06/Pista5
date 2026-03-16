import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Search, Image as ImageIcon, ChevronDown, ChevronUp, Clock, Users as UsersIcon, Repeat, FileText } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import type { DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';

import { useCreateSesion, useUpdateSesion, useSesion } from '@/hooks/useSesiones';
import { useEjercicios } from '@/hooks/useEjercicios';
import type { Ejercicio } from '@/lib/types-ejercicios';
import type { Sesion } from '@/lib/types-sesiones';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SelectedExercise extends Ejercicio {
    minutos_sesion?: number;
    numero_jugadores_sesion?: number;
    series_sesion?: number;
    notas_sesion?: string;
    isEditingFields?: boolean;
}

type FormData = Omit<Sesion, 'id' | 'coach_id' | 'created_at' | 'updated_at'>;

export default function SesionForm() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const microcicloId = searchParams.get('microciclo');
    const dateParam = searchParams.get('fecha');
    const isEditing = !!id;
    const navigate = useNavigate();

    const { data: sessionData, isLoading: loadingSession } = useSesion(id);
    const createMutation = useCreateSesion();
    const updateMutation = useUpdateSesion();

    const [formData, setFormData] = useState<FormData>({
        id_temporada: '',
        id_microciclo: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        lugar: '',
        objetivos: '',
        material: '',
        observaciones: '',
        feedback_tactico: '',
    });

    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    useEffect(() => {
        if (isEditing && sessionData) {
            setFormData({
                id_temporada: sessionData.id_temporada || '',
                id_microciclo: sessionData.id_microciclo,
                fecha: sessionData.fecha.split('T')[0],
                lugar: sessionData.lugar || '',
                objetivos: sessionData.objetivos || '',
                material: sessionData.material || '',
                observaciones: sessionData.observaciones || '',
                feedback_tactico: sessionData.feedback_tactico || '',
            });

            // Map exercises and include session-specific fields
            setSelectedExercises(sessionData.ejercicios.map(e => ({
                ...e.ejercicio,
                minutos_sesion: e.minutos || e.ejercicio.duracion_minutos || 0,
                numero_jugadores_sesion: e.numero_jugadores || e.ejercicio.n_jugadores || 0,
                series_sesion: e.series || 1,
                notas_sesion: e.notas_sesion || '',
                isEditingFields: false
            })));
        } else if (microcicloId) {
            setFormData(prev => ({
                ...prev,
                id_microciclo: microcicloId,
                fecha: dateParam || format(new Date(), 'yyyy-MM-dd')
            }));

            const fetchMicroData = async () => {
                const { data, error } = await supabase
                    .from('microciclos')
                    .select(`
                        id,
                        mesociclos:id_mesociclo (
                            id,
                            macrociclos:id_macrociclo (
                                id,
                                id_temporada
                            )
                        )
                    `)
                    .eq('id', microcicloId)
                    .single();

                if (!error && data) {
                    const meso = (data as any).mesociclos;
                    const macro = Array.isArray(meso) ? meso[0]?.macrociclos : meso?.macrociclos;
                    const tempId = Array.isArray(macro) ? macro[0]?.id_temporada : macro?.id_temporada;

                    if (tempId) {
                        setFormData(prev => ({ ...prev, id_temporada: tempId }));
                    }
                }
            };
            fetchMicroData();
        }
    }, [isEditing, sessionData, microcicloId, dateParam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const updateExerciseField = (index: number, field: keyof SelectedExercise, value: any) => {
        setSelectedExercises(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(selectedExercises);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSelectedExercises(items);
    };

    const removeExercise = (index: number) => {
        setSelectedExercises(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalMicroId = formData.id_microciclo || microcicloId;

        if (!finalMicroId) {
            toast.error('Error: No se ha detectado el Microciclo.');
            return;
        }

        try {
            // Prepare exercises with their metadata
            const exercisesPayload = selectedExercises.map(ex => ({
                id_ejercicio: ex.id,
                minutos: ex.minutos_sesion,
                numero_jugadores: ex.numero_jugadores_sesion,
                series: ex.series_sesion,
                notas_sesion: ex.notas_sesion
            }));

            const dataToSave = { ...formData, id_microciclo: finalMicroId };

            if (isEditing && id) {
                await updateMutation.mutateAsync({
                    id,
                    updates: dataToSave as Partial<Sesion>,
                    ejercicios: exercisesPayload
                });
                toast.success('Sesión actualizada');
            } else {
                await createMutation.mutateAsync({
                    sesion: dataToSave,
                    ejercicios: exercisesPayload
                });
                toast.success('Sesión creada');
            }
            navigate(`/sesiones/${finalMicroId}`);
        } catch (err: any) {
            toast.error('Error al guardar: ' + err.message);
        }
    };

    if (isEditing && loadingSession) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 px-4 sm:px-0">
                <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => navigate(-1)}
                    className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                        {isEditing ? 'Editar Sesión' : 'Nueva Sesión'}
                    </h1>
                    <p className="text-zinc-400">Planifica los contenidos y ejercicios del entrenamiento.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-zinc-50">Datos Generales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fecha" className="text-zinc-300">Fecha *</Label>
                                        <Input
                                            type="date" id="fecha" name="fecha"
                                            value={formData.fecha}
                                            onChange={handleChange}
                                            className="bg-zinc-950 border-zinc-800 text-zinc-100 [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lugar" className="text-zinc-300">Lugar / Pabellón</Label>
                                        <Input
                                            id="lugar" name="lugar"
                                            placeholder="Ej: Pabellón Municipal"
                                            value={formData.lugar || ''}
                                            onChange={handleChange}
                                            className="bg-zinc-950 border-zinc-800 text-zinc-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="objetivos" className="text-zinc-300">Objetivos Principales</Label>
                                    <Input
                                        id="objetivos" name="objetivos"
                                        placeholder="Ej: Salida de presión, Transiciones..."
                                        value={formData.objetivos || ''}
                                        onChange={handleChange}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="material" className="text-zinc-300">Material necesario</Label>
                                    <Input
                                        id="material" name="material"
                                        placeholder="Ej: 12 balones, 10 petos rojos..."
                                        value={formData.material || ''}
                                        onChange={handleChange}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="observaciones" className="text-zinc-300">Observaciones</Label>
                                    <Textarea
                                        id="observaciones" name="observaciones"
                                        placeholder="Notas adicionales..."
                                        value={formData.observaciones || ''}
                                        onChange={handleChange}
                                        className="min-h-[80px] bg-zinc-950 border-zinc-800 text-zinc-100"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl text-zinc-50">Contenidos / Tareas</CardTitle>
                                    <CardDescription>Configura los ejercicios de la sesión.</CardDescription>
                                </div>
                                <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                            <Plus className="h-4 w-4 mr-2" /> Añadir Ejercicio
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-50 p-0 overflow-hidden">
                                        <DialogHeader className="p-6 pb-0">
                                            <DialogTitle>Ejercicios</DialogTitle>
                                        </DialogHeader>
                                        <div className="p-6">
                                            <EjercicioSelector onSelect={(ex) => {
                                                const newEx: SelectedExercise = {
                                                    ...ex,
                                                    minutos_sesion: ex.duracion_minutos || 0,
                                                    numero_jugadores_sesion: ex.n_jugadores || 0,
                                                    series_sesion: 1,
                                                    notas_sesion: '',
                                                    isEditingFields: true
                                                };
                                                setSelectedExercises(prev => [...prev, newEx]);
                                                setIsSelectorOpen(false);
                                            }} />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                {selectedExercises.length === 0 ? (
                                    <div className="p-12 text-center text-zinc-500 border-t border-zinc-800 border-dashed bg-zinc-900/20">
                                        No has añadido ningún ejercicio todavía.
                                    </div>
                                ) : (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="exercises">
                                            {(provided: DroppableProvided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-zinc-800">
                                                    {selectedExercises.map((ex, index) => (
                                                        <Draggable key={`${ex.id}-${index}`} draggableId={`${ex.id}-${index}`} index={index}>
                                                            {(provided: DraggableProvided) => (
                                                                <div ref={provided.innerRef} {...provided.draggableProps} className="bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors group">
                                                                    <div className="flex items-center p-4">
                                                                        <div {...provided.dragHandleProps} className="mr-4 text-zinc-600 group-hover:text-zinc-400">
                                                                            <GripVertical className="h-5 w-5" />
                                                                        </div>
                                                                        <div className="h-12 w-12 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                                                            {ex.url_imagen ? (
                                                                                <img src={ex.url_imagen} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <ImageIcon className="h-5 w-5 text-zinc-800" />
                                                                            )}
                                                                        </div>
                                                                        <div className="ml-4 flex-1 min-w-0">
                                                                            <p className="text-sm font-bold text-zinc-100 truncate">{ex.titulo}</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
                                                                                    {ex.etapa_sesion}
                                                                                </Badge>
                                                                                <span className="text-xs text-zinc-500 font-medium">
                                                                                    {ex.minutos_sesion} min • {ex.series_sesion} {ex.series_sesion === 1 ? 'serie' : 'series'}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-1">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-zinc-500 hover:text-zinc-200"
                                                                                onClick={() => updateExerciseField(index, 'isEditingFields', !ex.isEditingFields)}
                                                                            >
                                                                                {ex.isEditingFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-zinc-500 hover:text-red-400"
                                                                                onClick={() => removeExercise(index)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {ex.isEditingFields && (
                                                                        <div className="px-14 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-1 duration-200">
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                                                                        <Clock className="h-3 w-3" /> Minutos
                                                                                    </Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={ex.minutos_sesion}
                                                                                        onChange={(e) => updateExerciseField(index, 'minutos_sesion', parseInt(e.target.value) || 0)}
                                                                                        className="bg-zinc-950 border-zinc-800 h-9 text-sm"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                                                                        <UsersIcon className="h-3 w-3" /> Jugadores
                                                                                    </Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={ex.numero_jugadores_sesion}
                                                                                        onChange={(e) => updateExerciseField(index, 'numero_jugadores_sesion', parseInt(e.target.value) || 0)}
                                                                                        className="bg-zinc-950 border-zinc-800 h-9 text-sm"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                                                                        <Repeat className="h-3 w-3" /> Series
                                                                                    </Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={ex.series_sesion}
                                                                                        onChange={(e) => updateExerciseField(index, 'series_sesion', parseInt(e.target.value) || 1)}
                                                                                        className="bg-zinc-950 border-zinc-800 h-9 text-sm"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                                                                    <FileText className="h-3 w-3" /> Notas específicas
                                                                                </Label>
                                                                                <Input
                                                                                    value={ex.notas_sesion}
                                                                                    onChange={(e) => updateExerciseField(index, 'notas_sesion', e.target.value)}
                                                                                    placeholder="Correcciones, variaciones para hoy..."
                                                                                    className="bg-zinc-950 border-zinc-800 h-9 text-sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <div className="sticky top-20">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-lg font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Guardando...' : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        {isEditing ? 'Actualizar Sesión' : 'Crear Sesión'}
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="w-full mt-3 border-zinc-800 text-zinc-500 hover:text-zinc-50"
                            >
                                Descartar cambios
                            </Button>

                            <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 italic">Resumen de Carga</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-zinc-400">
                                        <span className="font-medium">Total Tareas:</span>
                                        <span className="text-zinc-100 font-bold">{selectedExercises.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-400">
                                        <span className="font-medium">Tiempo total:</span>
                                        <span className="text-emerald-500 font-black italic text-lg">
                                            {selectedExercises.reduce((acc, curr) => acc + (curr.minutos_sesion || 0), 0)} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}

function EjercicioSelector({ onSelect }: { onSelect: (ex: Ejercicio) => void }) {
    const { data: standard } = useEjercicios(false);
    const { data: goalies } = useEjercicios(true);
    const [searchTerm, setSearchTerm] = useState('');

    const all = [...(standard || []), ...(goalies || [])];
    const filtered = all.filter(e =>
        e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.objetivo_principal?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Buscar ejercicio por nombre u objetivo..."
                    className="pl-9 bg-zinc-900 border-zinc-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
            <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-2">
                    {filtered.map((ex) => (
                        <div
                            key={ex.id}
                            className="flex items-center p-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 hover:border-emerald-500/50 cursor-pointer transition-all active:scale-[0.98]"
                            onClick={() => onSelect(ex)}
                        >
                            <div className="h-10 w-10 bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-zinc-800">
                                {ex.url_imagen ? <img src={ex.url_imagen} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-4 w-4 text-zinc-800" />}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-200 truncate leading-none mb-1">{ex.titulo}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        {ex.etapa_sesion}
                                    </span>
                                    {ex.es_portero && <Badge className="text-[9px] h-3.5 py-0 bg-amber-500/10 text-amber-500 border-none font-bold uppercase tracking-tighter">Porteros</Badge>}
                                </div>
                            </div>
                            <Plus className="h-4 w-4 text-emerald-500 ml-2" />
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-8 text-center text-zinc-600 text-sm italic">
                            No se encontraron ejercicios con ese nombre.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
