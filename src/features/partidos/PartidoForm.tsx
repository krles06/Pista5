import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Save, Users, Check } from 'lucide-react';

import { useCreatePartido, useUpdatePartido, usePartido } from '@/hooks/usePartidos';
import { useJugadores } from '@/hooks/useJugadores';
import { useTemporadas } from '@/hooks/useTemporadas';
import type { PartidoInsert, PartidoUpdate, AlineacionUpdate } from '@/lib/types-partidos';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PartidoForm() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const microcicloId = searchParams.get('microciclo');
    const seasonId = searchParams.get('temporada');
    const isEditing = !!id;
    const navigate = useNavigate();

    const { data: partidoData, isLoading: loadingPartido } = usePartido(id);
    const { data: temporadas } = useTemporadas();
    const [selectedTemporada, setSelectedTemporada] = useState<string>(seasonId || '');
    const { data: jugadores } = useJugadores(selectedTemporada);

    const createMutation = useCreatePartido();
    const updateMutation = useUpdatePartido();

    const [formData, setFormData] = useState<PartidoInsert>({
        id_temporada: selectedTemporada,
        id_microciclo: microcicloId || null,
        fecha: format(new Date(), 'yyyy-MM-dd'),
        rival: '',
        condicion: 'local',
        goles_local: 0,
        goles_visitante: 0,
        notas_tacticas: '',
        tipo_partido: 'Liga',
    });

    const [alineacion, setAlineacion] = useState<AlineacionUpdate[]>([]);

    useEffect(() => {
        if (isEditing && partidoData) {
            setFormData({
                id_temporada: partidoData.id_temporada,
                id_microciclo: partidoData.id_microciclo,
                fecha: partidoData.fecha.split('T')[0],
                rival: partidoData.rival || '',
                condicion: partidoData.condicion,
                goles_local: partidoData.goles_local || 0,
                goles_visitante: partidoData.goles_visitante || 0,
                notas_tacticas: partidoData.notas_tacticas || '',
                tipo_partido: partidoData.tipo_partido || 'Liga',
            });
            setSelectedTemporada(partidoData.id_temporada);
            setAlineacion(partidoData.alineacion.map((a: any) => ({
                id_jugador: a.id_jugador,
                es_titular: a.es_titular,
                minutos_jugados: a.minutos_jugados
            })));
        } else if (seasonId) {
            setSelectedTemporada(seasonId);
        }
    }, [isEditing, partidoData, seasonId]);

    useEffect(() => {
        if (selectedTemporada) {
            setFormData(prev => ({ ...prev, id_temporada: selectedTemporada }));
        }
    }, [selectedTemporada]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const togglePlayer = (jugadorId: string) => {
        setAlineacion(prev => {
            if (prev.find(a => a.id_jugador === jugadorId)) {
                return prev.filter(a => a.id_jugador !== jugadorId);
            }
            return [...prev, { id_jugador: jugadorId, es_titular: false, minutos_jugados: 0 }];
        });
    };

    const toggleTitular = (jugadorId: string) => {
        setAlineacion(prev => prev.map(a =>
            a.id_jugador === jugadorId ? { ...a, es_titular: !a.es_titular } : a
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id_temporada) {
            toast.error('Selecciona una temporada');
            return;
        }

        try {
            if (isEditing && id) {
                await updateMutation.mutateAsync({
                    id,
                    updates: formData as PartidoUpdate,
                    alineacion
                });
                toast.success('Partido actualizado');
            } else {
                await createMutation.mutateAsync({
                    partido: formData,
                    alineacion
                });
                toast.success('Partido creado');
            }
            navigate(-1);
        } catch (err: any) {
            toast.error('Error al guardar: ' + err.message);
        }
    };

    if (isEditing && loadingPartido) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => navigate(-1)}
                    className="border-border bg-card text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar Informe de Partido' : 'Nuevo Informe de Partido'}
                    </h1>
                    <p className="text-muted-foreground">Registra el resultado y la alineación del encuentro.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* General Info */}
                    <Card className="border-border bg-card shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-card/50">
                            <CardTitle className="text-lg text-foreground">Detalles del Encuentro</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Temporada *</Label>
                                    <Select
                                        value={selectedTemporada}
                                        onValueChange={setSelectedTemporada}
                                        disabled={isEditing}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Selecciona temporada" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border text-foreground">
                                            {temporadas?.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.temporada} - {t.equipo}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha" className="text-muted-foreground">Fecha *</Label>
                                    <Input
                                        type="date" id="fecha" name="fecha"
                                        value={formData.fecha}
                                        onChange={handleChange}
                                        className="bg-background border-border text-foreground [color-scheme:dark]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="rival" className="text-muted-foreground">Rival *</Label>
                                    <Input
                                        id="rival" name="rival"
                                        placeholder="Nombre del rival"
                                        value={formData.rival || ''}
                                        onChange={handleChange}
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Condición</Label>
                                    <div className="flex bg-background p-1 rounded-lg border border-border">
                                        <button
                                            type="button"
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.condicion === 'local' ? 'bg-emerald-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, condicion: 'local' }))}
                                        >
                                            LOCAL
                                        </button>
                                        <button
                                            type="button"
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.condicion === 'visitante' ? 'bg-emerald-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, condicion: 'visitante' }))}
                                        >
                                            VISITANTE
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-center justify-center py-4 bg-background/50 rounded-2xl border border-border/50">
                                <div className="text-center space-y-3">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Goles {formData.condicion === 'local' ? 'Nosotros' : 'Rival'}</Label>
                                    <Input
                                        type="number" name="goles_local"
                                        value={formData.goles_local || 0}
                                        onChange={handleChange}
                                        className="bg-card border-border text-center text-3xl font-black h-16 w-24 mx-auto rounded-xl"
                                    />
                                </div>
                                <div className="text-center space-y-3">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Goles {formData.condicion === 'visitante' ? 'Nosotros' : 'Rival'}</Label>
                                    <Input
                                        type="number" name="goles_visitante"
                                        value={formData.goles_visitante || 0}
                                        onChange={handleChange}
                                        className="bg-card border-border text-center text-3xl font-black h-16 w-24 mx-auto rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notas_tacticas" className="text-muted-foreground">Notas Tácticas / Crónica</Label>
                                <Textarea
                                    id="notas_tacticas" name="notas_tacticas"
                                    placeholder="Observaciones sobre el planteamiento, cambios, rendimiento..."
                                    value={formData.notas_tacticas || ''}
                                    onChange={handleChange}
                                    className="min-h-[150px] bg-background border-border text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Lineup Selection */}
                    <Card className="border-border bg-card shadow-xl overflow-hidden flex flex-col h-[600px]">
                        <CardHeader className="border-b border-border/50 bg-card/50 shrink-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                    <Users className="h-5 w-5 text-emerald-500" />
                                    Convocatoria
                                </CardTitle>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    {alineacion.length} Seleccionados
                                </Badge>
                            </div>
                            <CardDescription>Marca los jugadores que han participado.</CardDescription>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-2">
                                {!jugadores || jugadores.length === 0 ? (
                                    <p className="text-center text-muted-foreground text-sm py-8 italic">No hay jugadores en esta temporada.</p>
                                ) : (
                                    jugadores.map((jugador: any) => {
                                        const isInAlineacion = alineacion.find(a => a.id_jugador === jugador.id);
                                        return (
                                            <div
                                                key={jugador.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isInAlineacion ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'bg-background/30 border-border hover:border-border'}`}
                                                onClick={() => togglePlayer(jugador.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isInAlineacion ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                                        {isInAlineacion ? <Check className="h-4 w-4" /> : jugador.posicion?.[0] || 'J'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${isInAlineacion ? 'text-foreground' : 'text-muted-foreground'}`}>{jugador.nombre}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{jugador.posicion || 'Sin Pos.'}</span>
                                                    </div>
                                                </div>

                                                {isInAlineacion && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-7 px-2 text-[9px] font-black tracking-widest rounded-md ${isInAlineacion.es_titular ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 hover:text-zinc-950' : 'text-muted-foreground hover:text-foreground'}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleTitular(jugador.id); }}
                                                    >
                                                        {isInAlineacion.es_titular ? 'TITULAR' : 'SUPLENTE'}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                        <CardFooter className="p-4 bg-background/50 border-t border-border/50 shrink-0">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-lg shadow-emerald-900/20 font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Guardando...' : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        {isEditing ? 'Actualizar Informe' : 'Guardar Informe'}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}

function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={className}>{children}</div>;
}
