import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTemporada } from '@/hooks/useTemporadas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays, Target, Users, MapIcon, Trophy } from 'lucide-react';

export default function TemporadaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: temporada, isLoading, error } = useTemporada(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !temporada) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                Error al cargar la temporada. Puede que no exista o no tengas permisos.
                <Button onClick={() => navigate('/temporadas')} variant="link" className="ml-4 text-emerald-500">
                    Volver a temporadas
                </Button>
            </div>
        );
    }

    const startDate = new Date(temporada.fecha_inicio);
    const endDate = new Date(temporada.fecha_fin);
    const isActive = new Date() >= startDate && new Date() <= endDate;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header and Back button */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/temporadas')}
                    className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{temporada.temporada}</h1>
                        {isActive && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-transparent">
                                Temporada actual
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-semibold text-foreground">{temporada.equipo}</span>
                        {temporada.categoria && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span>{temporada.categoria}</span>
                            </>
                        )}
                    </p>
                </div>
                <Button
                    onClick={() => navigate(`/temporadas/${temporada.id}/editar`)}
                    variant="secondary"
                    className="bg-muted text-foreground hover:bg-muted"
                >
                    Editar información
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Main Info Column */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-border bg-card shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <CalendarDays className="h-5 w-5 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Período</p>
                                    <p className="font-medium text-foreground">
                                        {format(startDate, "d MMM yyyy", { locale: es })} — {format(endDate, "d MMM yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            {temporada.entrenador && (
                                <div className="flex items-start gap-3 text-sm">
                                    <Users className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="text-muted-foreground">Entrenador principal</p>
                                        <p className="font-medium text-foreground">{temporada.entrenador}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {temporada.objetivos && (
                        <Card className="border-border bg-card shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                    <Target className="h-5 w-5 text-emerald-500" />
                                    Objetivos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {temporada.objetivos}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Action Modules Column */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <Card className="border-border bg-card shadow-xl hover:border-emerald-500/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/planificacion/${temporada.id}`)}
                    >
                        <CardHeader>
                            <MapIcon className="h-8 w-8 text-emerald-500 mb-2" />
                            <CardTitle className="text-xl text-foreground">Planificación</CardTitle>
                            <CardDescription className="text-muted-foreground max-w-xs">
                                Gestiona Macrociclos, Mesociclos y Microciclos.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-border bg-card shadow-xl hover:border-emerald-500/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/calendario/${temporada.id}`)}
                    >
                        <CardHeader>
                            <Trophy className="h-8 w-8 text-emerald-500 mb-2" />
                            <CardTitle className="text-xl text-foreground">Sesiones y Partidos</CardTitle>
                            <CardDescription className="text-muted-foreground max-w-xs">
                                Diseña las sesiones de entrenamiento y el calendario competitivo.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-border bg-card shadow-xl hover:border-emerald-500/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/temporadas/${temporada.id}/jugadores`)}
                    >
                        <CardHeader>
                            <Users className="h-8 w-8 text-emerald-500 mb-2" />
                            <CardTitle className="text-xl text-foreground">Plantilla</CardTitle>
                            <CardDescription className="text-muted-foreground max-w-xs">
                                Jugadores inscritos en esta temporada, asistencias.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                </div>
            </div>
        </div>
    );
}
