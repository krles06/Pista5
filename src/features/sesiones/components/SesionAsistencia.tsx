import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, X, Save, Star, Users } from 'lucide-react';

import { useJugadores } from '@/hooks/useJugadores';
import { useAsistencia, useUpdateAsistencia } from '@/hooks/useAsistencia';
import type { AsistenciaUpdate, Sesion } from '@/lib/types-sesiones';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SesionAsistenciaProps {
    sesion: Sesion;
}

export default function SesionAsistencia({ sesion }: SesionAsistenciaProps) {
    const { data: jugadores } = useJugadores(sesion.id_temporada);
    const { data: asistenciasRepo, isLoading } = useAsistencia(sesion.id);
    const updateMutation = useUpdateAsistencia();

    const [asistencias, setAsistencias] = useState<AsistenciaUpdate[]>([]);

    useEffect(() => {
        if (jugadores && asistenciasRepo) {
            // Merge existing data with player list
            const initialAsistencias = jugadores.map(jugador => {
                const existing = asistenciasRepo.find(a => a.id_jugador === jugador.id);
                return {
                    id_jugador: jugador.id,
                    asistio: existing ? existing.asistio : true,
                    rpe: existing ? existing.rpe : null,
                    observaciones: existing ? existing.observaciones : ''
                };
            });
            setAsistencias(initialAsistencias);
        }
    }, [jugadores, asistenciasRepo]);

    const handleAsistenciaChange = (jugadorId: string, value: boolean) => {
        setAsistencias(prev => prev.map(a =>
            a.id_jugador === jugadorId ? { ...a, asistio: value, rpe: value ? a.rpe : null } : a
        ));
    };

    const handleRPEChange = (jugadorId: string, value: string) => {
        const rpe = value === '' ? null : parseInt(value);
        if (rpe !== null && (rpe < 1 || rpe > 10)) return;
        setAsistencias(prev => prev.map(a =>
            a.id_jugador === jugadorId ? { ...a, rpe } : a
        ));
    };

    const handleNotesChange = (jugadorId: string, value: string) => {
        setAsistencias(prev => prev.map(a =>
            a.id_jugador === jugadorId ? { ...a, observaciones: value } : a
        ));
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                id_sesion: sesion.id,
                asistencia: asistencias
            });
            toast.success('Asistencia y RPE guardados correctamente');
        } catch (e: any) {
            toast.error('Error al guardar: ' + e.message);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando asistencia...</div>;

    return (
        <Card className="border-border bg-card shadow-xl overflow-hidden flex flex-col h-[600px]">
            <CardHeader className="border-b border-border/50 bg-card/50 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-foreground flex items-center gap-2">
                            <Users className="h-5 w-5 text-emerald-500" />
                            Control de Asistencia y RPE
                        </CardTitle>
                        <CardDescription>Marca quién ha entrenado y su nivel de esfuerzo (1-10).</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold">
                        {asistencias.filter(a => a.asistio).length} / {asistencias.length} Presentes
                    </Badge>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {asistencias.map((asistencia) => {
                        const jugador = jugadores?.find(j => j.id === asistencia.id_jugador);
                        if (!jugador) return null;

                        return (
                            <div
                                key={jugador.id}
                                className={`p-3 rounded-xl border transition-all ${asistencia.asistio ? 'bg-background/30 border-border' : 'bg-red-500/5 border-red-500/10 opacity-60'}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${asistencia.asistio ? 'bg-emerald-600 text-white' : 'bg-red-900/40 text-red-500'}`}
                                            onClick={() => handleAsistenciaChange(jugador.id, !asistencia.asistio)}
                                        >
                                            {asistencia.asistio ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-foreground truncate">{jugador.nombre}</span>
                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{jugador.posicion || 'JUGADOR'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="flex flex-col gap-1 items-center">
                                            <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">ASISTIÓ</Label>
                                            <Switch
                                                checked={asistencia.asistio}
                                                onCheckedChange={(val) => handleAsistenciaChange(jugador.id, val)}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1 items-center">
                                            <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">RPE (1-10)</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    disabled={!asistencia.asistio}
                                                    value={asistencia.rpe || ''}
                                                    onChange={(e) => handleRPEChange(jugador.id, e.target.value)}
                                                    className={`h-9 w-14 text-center font-black bg-card border-border text-foreground rounded-lg ${!asistencia.asistio && 'opacity-30'}`}
                                                />
                                                {asistencia.asistio && asistencia.rpe && (
                                                    <Star className="h-2.5 w-2.5 text-amber-500 absolute -top-1 -right-1 fill-amber-500" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 hidden sm:flex">
                                            <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">NOTAS</Label>
                                            <Input
                                                placeholder="Molestias, actitud..."
                                                value={asistencia.observaciones || ''}
                                                onChange={(e) => handleNotesChange(jugador.id, e.target.value)}
                                                className="h-9 w-40 text-xs bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="p-4 bg-background/50 border-t border-border/50">
                <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-lg shadow-emerald-900/20"
                >
                    {updateMutation.isPending ? 'Guardando...' : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Control de Sesión
                        </>
                    )}
                </Button>
            </div>
        </Card>
    );
}
