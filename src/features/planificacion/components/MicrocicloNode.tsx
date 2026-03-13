import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit2, Trash2, CalendarHeart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import type { Mesociclo, Microciclo } from '@/lib/types-planificacion';
import { useDeleteMicrociclo } from '@/hooks/usePlanificacion';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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

import MicrocicloFormModal from './MicrocicloFormModal';

interface Props {
    microciclo: Microciclo;
    mesociclo: Mesociclo;
}

export default function MicrocicloNode({ microciclo, mesociclo }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const deleteMutation = useDeleteMicrociclo();
    const navigate = useNavigate();

    const startDate = new Date(microciclo.fecha_inicio);
    const endDate = new Date(microciclo.fecha_fin);

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(microciclo.id);
            toast.success('Microciclo eliminado');
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message);
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    return (
        <>
            <Card className="border-emerald-700/20 bg-zinc-950/80 shadow-none hover:bg-zinc-800/60 transition-colors">
                <CardHeader className="p-0">
                    <div className="flex items-center justify-between p-2.5">
                        <div className="flex items-center gap-3 pl-2">
                            <CalendarHeart className="h-4 w-4 text-emerald-600/70" />
                            <div>
                                <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                                    {microciclo.nombre}
                                    {microciclo.tipo && (
                                        <span className="text-[9px] font-normal px-1.5 py-0.5 rounded border bg-zinc-900 border-zinc-800 text-zinc-500">
                                            {microciclo.tipo}
                                        </span>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                                    <span>{format(startDate, "d MMM", { locale: es })} — {format(endDate, "d MMM", { locale: es })}</span>
                                    {microciclo.objetivos && (
                                        <>
                                            <span className="text-zinc-700">•</span>
                                            <span className="truncate max-w-[150px] sm:max-w-xs">{microciclo.objetivos}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2 bg-emerald-950/20 border-emerald-900/30 text-emerald-500 hover:bg-emerald-900/40 mr-2"
                                onClick={() => navigate(`/sesiones/${microciclo.id}`)}
                            >
                                Ver Sesiones
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-50" onClick={() => setIsEditModalOpen(true)}>
                                <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-red-400" onClick={() => setIsDeleteAlertOpen(true)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Edit Form Modal */}
            {isEditModalOpen && (
                <MicrocicloFormModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    mesociclo={mesociclo}
                    microciclo={microciclo}
                />
            )}

            {/* Delete Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Microciclo?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Se eliminará este microciclo y todas las sesiones de entrenamiento en su interior.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
