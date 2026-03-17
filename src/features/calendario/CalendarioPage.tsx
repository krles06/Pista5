import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Trophy, CheckCircle, CalendarDays, Calendar as CalendarIcon, Trash2, ArrowLeft } from 'lucide-react';

import { useAllSesiones, useDeleteSesion } from '@/hooks/useSesiones';
import { usePartidos } from '@/hooks/usePartidos';
import { useTemporada } from '@/hooks/useTemporadas';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ViewMode = 'month' | 'week';

export default function CalendarioPage() {
    const { id_temporada } = useParams<{ id_temporada: string }>();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    // Fetch data
    const { data: sesiones, isLoading: loadingSesiones } = useAllSesiones(id_temporada);
    const { data: partidos, isLoading: loadingPartidos } = usePartidos(id_temporada);
    const { data: temporada } = useTemporada(id_temporada);

    const deleteSesion = useDeleteSesion();

    const nextPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const prevPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleDeleteSesion = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent navigating to session details
        if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión permanentemente?')) {
            try {
                await deleteSesion.mutateAsync(id);
                toast.success('Sesión eliminada correctamente');
            } catch (error: any) {
                toast.error(error.message || 'Error al eliminar la sesión');
            }
        }
    };

    // Calculate calendar days based on view mode
    let startDate, endDate;
    if (viewMode === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    } else {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    }

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const isLoading = loadingSesiones || loadingPartidos;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    // Dynamic title logic based on view mode
    let periodTitle = format(currentDate, 'MMMM yyyy', { locale: es });
    if (viewMode === 'week') {
        const titleStart = format(startDate, 'd', { locale: es });
        const titleEnd = format(endDate, 'd MMMM yyyy', { locale: es });
        const startMonth = format(startDate, 'MMMM', { locale: es });
        const endMonth = format(endDate, 'MMMM', { locale: es });

        if (startMonth === endMonth) {
            periodTitle = `${titleStart} - ${titleEnd}`;
        } else {
            periodTitle = `${titleStart} ${startMonth} - ${titleEnd}`;
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {id_temporada && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/temporadas/${id_temporada}`)}
                            className="border-border bg-card text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div>
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 mb-2 font-black uppercase tracking-widest text-[10px]">
                            {temporada ? `${temporada.equipo} - ${temporada.temporada}` : 'General'}
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <CalendarDays className="h-8 w-8 text-emerald-500" />
                            {temporada ? 'Calendario de Temporada' : 'Calendario Global'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {temporada
                                ? `Sesiones y partidos planificados para la temporada ${temporada.temporada}.`
                                : 'Visión global de todas las sesiones de entrenamiento y partidos de la temporada.'}
                        </p>
                    </div>
                </div>

                {/* View toggles */}
                <div className="flex items-center rounded-lg bg-card border border-border p-1 w-fit">
                    <button
                        onClick={() => setViewMode('month')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        Mes
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <CalendarDays className="h-4 w-4" />
                        Semana
                    </button>
                </div>
            </div>

            {/* Calendar View */}
            <Card className="border-border bg-card shadow-xl overflow-hidden">
                {/* Calendar Controls */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
                    <h2 className="text-xl font-bold text-foreground capitalize">
                        {periodTitle}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevPeriod} className="h-8 w-8 border-border bg-card hover:bg-muted text-foreground">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-bold border-border bg-card hover:bg-muted text-foreground">
                            HOY
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextPeriod} className="h-8 w-8 border-border bg-card hover:bg-muted text-foreground">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 border-b border-border bg-card/80">
                    {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
                        <div key={day} className="py-2 text-center text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 bg-muted gap-[1px]">
                    {days.map((day, i) => {
                        // In month view, detect if day is part of current month for dimming effect
                        const isCurrentMonth = viewMode === 'week' || isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        // Find events for this day
                        let dayPartidos = partidos?.filter(p => isSameDay(new Date(p.fecha), day)) || [];
                        let daySesiones = sesiones?.filter(s => isSameDay(new Date(s.fecha), day)) || [];

                        // If filtered by season, filter sessions too (partidos are already filtered by hook if id_temporada exists)
                        if (id_temporada) {
                            daySesiones = daySesiones.filter(s => s.id_temporada === id_temporada);
                        }

                        return (
                            <div
                                key={i}
                                className={`
                                    min-h-[120px] bg-card p-2 transition-colors hover:bg-muted/80 
                                    ${!isCurrentMonth ? 'opacity-40 bg-background' : ''}
                                    ${viewMode === 'week' ? 'min-h-[200px] sm:min-h-[300px]' : ''}
                                `}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-muted-foreground'}`}>
                                        {format(day, dateFormat)}
                                    </span>
                                </div>

                                <div className={`space-y-1.5 overflow-y-auto custom-scrollbar ${viewMode === 'week' ? 'max-h-[250px]' : 'max-h-[80px]'}`}>
                                    {/* Partidos */}
                                    {dayPartidos.map(partido => (
                                        <div
                                            key={partido.id}
                                            onClick={() => navigate(`/partidos/${partido.id}/editar`)}
                                            className="group px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-xs cursor-pointer hover:bg-amber-500/20 font-medium flex items-center justify-between gap-1.5 transition-colors"
                                        >
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Trophy className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{partido.rival || 'Partido'}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Sesiones */}
                                    {daySesiones.map(sesion => (
                                        <div
                                            key={sesion.id}
                                            onClick={() => navigate(`/sesiones/${sesion.id}/ver`)}
                                            className="group px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-xs cursor-pointer hover:bg-emerald-500/20 font-medium flex items-center justify-between gap-1.5 transition-colors"
                                        >
                                            <div className="flex items-center gap-1.5 truncate">
                                                <CheckCircle className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{sesion.objetivos || 'Sesión'}</span>
                                            </div>
                                            <div
                                                className="hidden group-hover:block shrink-0 px-1 hover:text-red-500 transition-colors"
                                                onClick={(e) => handleDeleteSesion(e, sesion.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
