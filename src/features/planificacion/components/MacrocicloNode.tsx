import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { Temporada } from '@/lib/types';
import type { Macrociclo } from '@/lib/types-planificacion';
import { useMesociclos, useDeleteMacrociclo } from '@/hooks/usePlanificacion';

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

import MesocicloNode from './MesocicloNode';
import MacrocicloFormModal from './MacrocicloFormModal';
import MesocicloFormModal from './MesocicloFormModal';

interface Props {
    macrociclo: Macrociclo;
    temporada: Temporada;
}

export default function MacrocicloNode({ macrociclo, temporada }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMesoModalOpen, setIsAddMesoModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const { data: mesociclos, isLoading } = useMesociclos(macrociclo.id);
    const deleteMutation = useDeleteMacrociclo();

    const startDate = new Date(macrociclo.fecha_inicio);
    const endDate = new Date(macrociclo.fecha_fin);

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(macrociclo.id);
            toast.success('Macrociclo eliminado');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    return (
        <Card className="border-emerald-900/50 bg-card shadow-sm overflow-hidden transition-all">
            <CardHeader className="p-0">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-emerald-500" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-emerald-500" />
                        )}
                        <div>
                            <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                {macrociclo.nombre}
                                {macrociclo.tipo && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{macrociclo.tipo}</span>}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                {format(startDate, "d MMM", { locale: es })} — {format(endDate, "d MMM yyyy", { locale: es })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-400" onClick={() => setIsAddMesoModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsEditModalOpen(true)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10" onClick={() => setIsDeleteAlertOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-0 border-t border-border/50 bg-background/30">
                    <div className="p-4 pl-12 space-y-3 relative before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-muted">
                        {macrociclo.objetivos && (
                            <p className="text-sm text-muted-foreground mb-4 bg-card/50 p-3 rounded-md border border-border/50">
                                <span className="font-semibold block text-foreground mb-1">Objetivos:</span>
                                {macrociclo.objetivos}
                            </p>
                        )}

                        {isLoading ? (
                            <div className="text-sm text-muted-foreground py-2">Cargando mesociclos...</div>
                        ) : !mesociclos || mesociclos.length === 0 ? (
                            <div className="text-sm border border-dashed border-border rounded-md p-4 text-center text-muted-foreground">
                                No hay mesociclos en este bloque.
                                <Button variant="link" className="text-emerald-500 py-0 h-auto" onClick={() => setIsAddMesoModalOpen(true)}>Crear el primero</Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {mesociclos.map((meso) => (
                                    <MesocicloNode key={meso.id} mesociclo={meso} macrociclo={macrociclo} />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            )}

            {/* Edit Form Modal */}
            {isEditModalOpen && (
                <MacrocicloFormModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    temporada={temporada}
                    macrociclo={macrociclo}
                />
            )}

            {/* Add Meso Form Modal */}
            {isAddMesoModalOpen && (
                <MesocicloFormModal
                    isOpen={isAddMesoModalOpen}
                    onClose={() => setIsAddMesoModalOpen(false)}
                    macrociclo={macrociclo}
                />
            )}

            {/* Delete Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="bg-card border-border text-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Macrociclo?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Se eliminará este macrociclo y todos los mesociclos, microciclos y sesiones en su interior.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted text-foreground border-border">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
