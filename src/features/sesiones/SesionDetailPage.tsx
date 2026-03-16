import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
    ArrowLeft,
    Clock,
    Users,
    MapPin,
    Edit,
    FileText,
    ChevronRight,
    ClipboardList,
    Target
} from 'lucide-react';

import { useSesion } from '@/hooks/useSesiones';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SesionAsistencia from './components/SesionAsistencia';

export default function SesionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: sesion, isLoading } = useSesion(id);
    const [exportingPDF, setExportingPDF] = useState(false);

    const handleExportPDF = async () => {
        if (!sesion) return;

        try {
            setExportingPDF(true);
            const { data: { session } } = await supabase.auth.getSession();
            // Refresh session first to ensure token is valid
            const { data: { session: refreshed } } = await supabase.auth.refreshSession();
            const token = refreshed?.access_token ?? session?.access_token;

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generar-pdf-sesion`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ sesion_id: sesion.id }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const html = await response.text();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'No se pudo generar el PDF. Inténtalo de nuevo.');
        } finally {
            setExportingPDF(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!sesion) {
        return (
            <div className="p-8 text-center text-zinc-500">
                No se encontró la sesión.
                <Button onClick={() => navigate(-1)} variant="link">Volver</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/sesiones/${sesion.id_microciclo}`)}
                        className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-50 shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 uppercase text-[10px] tracking-widest font-bold">
                                {format(new Date(sesion.fecha), "EEEE d MMM", { locale: es })}
                            </Badge>
                            {sesion.lugar && (
                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {sesion.lugar}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                            {sesion.objetivos || "Plan de Entrenamiento"}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50"
                        onClick={() => navigate(`/sesiones/${sesion.id}/editar`)}
                    >
                        <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button
                        className="bg-zinc-100 text-zinc-900 hover:bg-white font-medium"
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                    >
                        {exportingPDF ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent mr-2" />
                        ) : (
                            <FileText className="h-4 w-4 mr-2" />
                        )}
                        {exportingPDF ? 'Generando...' : 'Exportar PDF'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left column - Session Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" /> Resumen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500">Material necesario</p>
                                <p className="text-sm text-zinc-200">{sesion.material || 'No especificado'}</p>
                            </div>
                            <Separator className="bg-zinc-800" />
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500">Observaciones</p>
                                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{sesion.observaciones || 'Sin notas'}</p>
                            </div>
                            <Separator className="bg-zinc-800" />
                            <div className="flex justify-between items-center text-sm pt-1">
                                <span className="text-zinc-500">Total Ejercicios</span>
                                <span className="font-bold text-emerald-500">{sesion.ejercicios.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Tiempo Estimado</span>
                                <span className="font-bold text-emerald-500">
                                    {sesion.ejercicios.reduce((acc, curr) => acc + (curr.ejercicio.duracion_minutos || 0), 0)} min
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedback Táctico Section */}
                    <Card className="border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Análisis Táctico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 min-h-[100px]">
                                {sesion.feedback_tactico ? (
                                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                        {sesion.feedback_tactico}
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-600 italic">
                                        Sin observaciones tácticas después de la sesión.
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/sesiones/${sesion.id}/editar`)}
                                className="w-full mt-4 text-xs font-black tracking-widest text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 border border-dashed border-zinc-800"
                            >
                                ACTUALIZAR ANÁLISIS
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column - Exercise list & Attendance */}
                <div className="md:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2 px-1">
                            <Target className="h-5 w-5 text-emerald-500" /> Ejercicios Planificados
                        </h2>

                        {sesion.ejercicios.length === 0 ? (
                            <div className="p-8 text-center text-zinc-600 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                                No hay ejercicios añadidos a esta sesión.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sesion.ejercicios.map((se, index) => (
                                    <Card key={se.id} className="border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden hover:border-zinc-700 transition-colors">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-zinc-950 border-b sm:border-b-0 sm:border-r border-zinc-800 shrink-0">
                                                {se.ejercicio.url_imagen ? (
                                                    <img src={se.ejercicio.url_imagen} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                                        <FileText className="h-12 w-12" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                                                        {index + 1}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-zinc-500 border-zinc-800">
                                                        {se.ejercicio.etapa_sesion}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-bold text-zinc-100 mb-2">{se.ejercicio.titulo}</h3>
                                                <p className="text-sm text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                                                    {se.ejercicio.objetivo_principal}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span>{se.ejercicio.duracion_minutos || '--'} min</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span>{se.ejercicio.n_jugadores || '--'} jug.</span>
                                                    </div>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 ml-auto text-emerald-500 hover:text-emerald-400 text-xs"
                                                        onClick={() => navigate(se.ejercicio.es_portero ? `/porteros/${se.id_ejercicio}` : `/ejercicios/${se.id_ejercicio}`)}
                                                    >
                                                        Ver ficha completa <ChevronRight className="h-3 w-3 inline ml-0.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attendance and RPE */}
                    <div className="pt-4">
                        <SesionAsistencia sesion={sesion} />
                    </div>
                </div>

            </div>
        </div>
    );
}
