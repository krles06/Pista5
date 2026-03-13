import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Macrociclo, Mesociclo } from '@/lib/types-planificacion';
import { useCreateMesociclo, useUpdateMesociclo } from '@/hooks/usePlanificacion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    macrociclo: Macrociclo;
    mesociclo?: Mesociclo; // Si existe, editamos; si no, creamos
}

export default function MesocicloFormModal({ isOpen, onClose, macrociclo, mesociclo }: Props) {
    const isEditing = !!mesociclo;

    const createMutation = useCreateMesociclo();
    const updateMutation = useUpdateMesociclo();

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
            if (isEditing && mesociclo) {
                setFormData({
                    nombre: mesociclo.nombre,
                    tipo: mesociclo.tipo || '',
                    fecha_inicio: mesociclo.fecha_inicio.split('T')[0],
                    fecha_fin: mesociclo.fecha_fin.split('T')[0],
                    objetivos: mesociclo.objetivos || '',
                });
            } else {
                // Defaults for new
                setFormData({
                    nombre: 'Mesociclo ',
                    tipo: 'Adquisición',
                    fecha_inicio: macrociclo.fecha_inicio.split('T')[0],
                    fecha_fin: macrociclo.fecha_fin.split('T')[0], // Normally one month aprox
                    objetivos: '',
                });
            }
        }
    }, [isOpen, isEditing, mesociclo, macrociclo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            toast.error('La fecha de fin debe ser posterior a la de inicio');
            return;
        }

        try {
            if (isEditing && mesociclo) {
                await updateMutation.mutateAsync({ id: mesociclo.id, updates: formData });
                toast.success('Mesociclo actualizado');
            } else {
                await createMutation.mutateAsync({ ...formData, id_macrociclo: macrociclo.id });
                toast.success('Mesociclo creado');
            }
            onClose();
        } catch (e: any) {
            toast.error('Error al guardar: ' + e.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-50">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Mesociclo' : 'Nuevo Mesociclo'}</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Mesociclo perteneciente a: <strong>{macrociclo.nombre}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombre" className="text-right text-zinc-300">Nombre *</Label>
                            <Input
                                id="nombre"
                                className="col-span-3 bg-zinc-900 border-zinc-800"
                                placeholder="Ej: Mesociclo 1, Enero..."
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tipo" className="text-right text-zinc-300">Tipo</Label>
                            <Input
                                id="tipo"
                                className="col-span-3 bg-zinc-900 border-zinc-800"
                                placeholder="Ej: Adquisición, Estabilización..."
                                value={formData.tipo}
                                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fecha_inicio" className="text-right text-zinc-300">Inicio *</Label>
                            <Input
                                id="fecha_inicio"
                                type="date"
                                className="col-span-3 bg-zinc-900 border-zinc-800 [color-scheme:dark]"
                                value={formData.fecha_inicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fecha_fin" className="text-right text-zinc-300">Fin *</Label>
                            <Input
                                id="fecha_fin"
                                type="date"
                                className="col-span-3 bg-zinc-900 border-zinc-800 [color-scheme:dark]"
                                value={formData.fecha_fin}
                                onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="objetivos" className="text-right text-zinc-300 mt-2">Objetivos</Label>
                            <Textarea
                                id="objetivos"
                                className="col-span-3 bg-zinc-900 border-zinc-800"
                                placeholder="Objetivos para estas 4-6 semanas..."
                                rows={3}
                                value={formData.objetivos}
                                onChange={(e) => setFormData(prev => ({ ...prev, objetivos: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400 hover:text-zinc-50">
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
