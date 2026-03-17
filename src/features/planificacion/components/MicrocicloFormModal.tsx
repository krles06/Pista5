import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import type { Mesociclo, Microciclo } from '@/lib/types-planificacion';
import { useCreateMicrociclo, useUpdateMicrociclo } from '@/hooks/usePlanificacion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mesociclo: Mesociclo;
    microciclo?: Microciclo; // Si existe, editamos; si no, creamos
}

export default function MicrocicloFormModal({ isOpen, onClose, mesociclo, microciclo }: Props) {
    const isEditing = !!microciclo;

    const createMutation = useCreateMicrociclo();
    const updateMutation = useUpdateMicrociclo();

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        fecha_inicio: '',
        fecha_fin: '',
        objetivos: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && microciclo) {
                setFormData({
                    nombre: microciclo.nombre,
                    tipo: microciclo.tipo || '',
                    fecha_inicio: microciclo.fecha_inicio.split('T')[0],
                    fecha_fin: microciclo.fecha_fin.split('T')[0],
                    objetivos: microciclo.objetivos || '',
                });
            } else {
                // Defaults for new: 1 week length
                const startDatePosible = new Date(mesociclo.fecha_inicio);
                const endDatePosible = addDays(startDatePosible, 6);

                setFormData({
                    nombre: 'Microciclo 1',
                    tipo: 'Carga',
                    fecha_inicio: format(startDatePosible, 'yyyy-MM-dd'),
                    fecha_fin: format(endDatePosible, 'yyyy-MM-dd'),
                    objetivos: '',
                });
            }
        }
    }, [isOpen, isEditing, microciclo, mesociclo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            toast.error('La fecha de fin debe ser posterior a la de inicio');
            return;
        }

        try {
            if (isEditing && microciclo) {
                await updateMutation.mutateAsync({ id: microciclo.id, updates: formData });
                toast.success('Microciclo actualizado');
            } else {
                await createMutation.mutateAsync({ ...formData, id_mesociclo: mesociclo.id });
                toast.success('Microciclo creado');
            }
            onClose();
        } catch (e: any) {
            toast.error('Error al guardar: ' + (e?.message || JSON.stringify(e)));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-background border-border text-foreground">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Microciclo' : 'Nuevo Microciclo'}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Microciclo perteneciente a: <strong>{mesociclo.nombre}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombre" className="text-right text-foreground">Nombre *</Label>
                            <Input
                                id="nombre"
                                className="col-span-3 bg-card border-border"
                                placeholder="Ej: Micro 1, Semana 1..."
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tipo" className="text-right text-foreground">Tipo</Label>
                            <Input
                                id="tipo"
                                className="col-span-3 bg-card border-border"
                                placeholder="Ej: Carga, Choque, Recuperación..."
                                value={formData.tipo}
                                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fecha_inicio" className="text-right text-foreground">Inicio *</Label>
                            <Input
                                id="fecha_inicio"
                                type="date"
                                className="col-span-3 bg-card border-border [color-scheme:dark]"
                                value={formData.fecha_inicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fecha_fin" className="text-right text-foreground">Fin *</Label>
                            <Input
                                id="fecha_fin"
                                type="date"
                                className="col-span-3 bg-card border-border [color-scheme:dark]"
                                value={formData.fecha_fin}
                                onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="objetivos" className="text-right text-foreground mt-2">Objetivos</Label>
                            <Textarea
                                id="objetivos"
                                className="col-span-3 bg-card border-border"
                                placeholder="Micro-objetivos semanales..."
                                rows={3}
                                value={formData.objetivos}
                                onChange={(e) => setFormData(prev => ({ ...prev, objetivos: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
