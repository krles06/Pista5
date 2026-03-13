import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { Macrociclo, Mesociclo } from '@/lib/types-planificacion';
import { useMicrociclos, useDeleteMesociclo } from '@/hooks/usePlanificacion';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

import MicrocicloNode from './MicrocicloNode';
import MesocicloFormModal from './MesocicloFormModal';

interface Props {
    mesociclo: Mesociclo;
    macrociclo: Macrociclo;
}

export default function MesocicloNode({ mesociclo, macrociclo }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMicroModalOpen, setIsAddMicroModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const { data: microciclos, isLoading } = useMicrociclos(mesociclo.id);
    const deleteMutation = useDeleteMesociclo();

    const startDate = new Date(mesociclo.fecha_inicio);
    const endDate = new Date(mesociclo.fecha_fin);

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(mesociclo.id);
            toast.success('Mesociclo eliminado');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    return (
        <Card className="border-emerald-800/30 bg-zinc-900/80 shadow-sm overflow-hidden transition-all">
            <CardHeader className="p-0">
                <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-800/40"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-emerald-600" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-emerald-600" />
                        )}
                        <div>
                            <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                                {mesociclo.nombre}
                                {mesociclo.tipo && <span className="text-[10px] font-normal px-2 py-0.5 rounded border bg-zinc-800 border-zinc-700 text-zinc-400">{mesociclo.tipo}</span>}
                            </CardTitle>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {format(startDate, "d MMM", { locale: es })} — {format(endDate, "d MMM", { locale: es })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-emerald-400" onClick={() => setIsAddMicroModalOpen(true)}>
                            <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-50" onClick={() => setIsEditModalOpen(true)}>
                            <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400" onClick={() => setIsDeleteAlertOpen(true)}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-0 border-t border-zinc-800/20 bg-zinc-950/50">
                    <div className="p-3 pl-8 space-y-2 relative before:absolute before:inset-y-0 before:left-4 before:w-[px] before:bg-zinc-800/50">
                        {isLoading ? (
                            <div className="text-xs text-zinc-600 py-1">Cargando microciclos...</div>
                        ) : !microciclos || microciclos.length === 0 ? (
                            <div className="text-xs text-zinc-600 py-2 border border-dashed border-zinc-800 rounded px-3">
                                No hay microciclos.
                                <Button variant="link" className="text-emerald-500 py-0 h-auto text-xs px-1" onClick={() => setIsAddMicroModalOpen(true)}>Añadir</Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {microciclos.map((micro) => (
                                    <MicrocicloNode key={micro.id} microciclo={micro} mesociclo={mesociclo} />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            )}

            {/* Edit Form Modal */}
            {isEditModalOpen && (
                <MesocicloFormModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    macrociclo={macrociclo}
                    mesociclo={mesociclo}
                />
            )}

            {/* Add Micro Form Modal */}
            {isAddMicroModalOpen && (
                <MicrocicloFormModal
                    isOpen={isAddMicroModalOpen}
                    onClose={() => setIsAddMicroModalOpen(false)}
                    mesociclo={mesociclo}
                />
            )}

            {/* Delete Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Mesociclo?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Se eliminará este mesociclo y todos los microciclos y sesiones en su interior.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
