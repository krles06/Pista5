import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTemporada } from '@/hooks/useTemporadas';
import { useMacrociclos } from '@/hooks/usePlanificacion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapIcon, ChevronRight, Plus } from 'lucide-react';

import MacrocicloNode from './components/MacrocicloNode';
import MacrocicloFormModal from './components/MacrocicloFormModal';

export default function PlanificacionPage() {
    const { id_temp } = useParams<{ id_temp: string }>();
    const navigate = useNavigate();

    const { data: temporada, isLoading: loadingTemp } = useTemporada(id_temp);
    const { data: macrociclos, isLoading: loadingMacros } = useMacrociclos(id_temp);

    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);

    if (loadingTemp || loadingMacros) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!temporada) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                Temporada no encontrada.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/temporadas/${temporada.id}`)}
                    className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/temporadas')}>Temporadas</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate(`/temporadas/${temporada.id}`)}>{temporada.temporada}</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">Planificación</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <MapIcon className="h-8 w-8 text-emerald-500" />
                        Estructura de la Temporada
                    </h1>
                </div>
                <Button
                    onClick={() => setIsMacroModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Macrociclo
                </Button>
            </div>

            <Card className="border-border bg-card/50 shadow-none border-dashed">
                <CardContent className="p-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Límites de temporada: <strong>{format(new Date(temporada.fecha_inicio), "dd/MM/yyyy")}</strong> - <strong>{format(new Date(temporada.fecha_fin), "dd/MM/yyyy")}</strong></span>
                    <span>Asegúrate de que los bloques (Macro, Meso, Micro) estén dentro de estas fechas.</span>
                </CardContent>
            </Card>

            {/* Tree View container */}
            <div className="space-y-4">
                {!macrociclos || macrociclos.length === 0 ? (
                    <Card className="border-border bg-card shadow-xl border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <MapIcon className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground">Planificación vacía</h3>
                            <p className="text-muted-foreground mt-1 mb-4">Empieza estructurando la temporada en grandes bloques (Macrociclos).</p>
                            <Button onClick={() => setIsMacroModalOpen(true)} variant="outline" className="border-border text-foreground">
                                Añadir Macrociclo
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    macrociclos.map(macro => (
                        <MacrocicloNode key={macro.id} macrociclo={macro} temporada={temporada} />
                    ))
                )}
            </div>

            <MacrocicloFormModal
                isOpen={isMacroModalOpen}
                onClose={() => setIsMacroModalOpen(false)}
                temporada={temporada}
            />
        </div>
    );
}
