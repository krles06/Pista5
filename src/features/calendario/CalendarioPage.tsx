import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Trophy, CheckCircle, CalendarDays } from 'lucide-react';

import { useAllSesiones } from '@/hooks/useSesiones';
import { usePartidos } from '@/hooks/usePartidos';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CalendarioPage() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fecth all global sessions and matches
    const { data: sesiones, isLoading: loadingSesiones } = useAllSesiones();
    const { data: partidos, isLoading: loadingPartidos } = usePartidos();

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calculate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const isLoading = loadingSesiones || loadingPartidos;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 mb-2 font-black uppercase tracking-widest text-[10px]">
                        General
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50 flex items-center gap-3">
                        <CalendarDays className="h-8 w-8 text-emerald-500" />
                        Calendario
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Visión global de todas las sesiones de entrenamiento y partidos de la temporada.
                    </p>
                </div>
            </div>

            {/* Calendar View */}
            <Card className="border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
                {/* Calendar Controls */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
                    <h2 className="text-xl font-bold text-zinc-100 capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="h-8 text-xs font-bold border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                            HOY
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/80">
                    {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
                        <div key={day} className="py-2 text-center text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 bg-zinc-800 gap-[1px]">
                    {days.map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        // Find events for this day
                        const dayPartidos = partidos?.filter(p => isSameDay(new Date(p.fecha), day)) || [];
                        const daySesiones = sesiones?.filter(s => isSameDay(new Date(s.fecha), day)) || [];

                        return (
                            <div
                                key={i}
                                className={`min-h-[120px] bg-zinc-900 p-2 transition-colors hover:bg-zinc-800/80 ${!isCurrentMonth ? 'opacity-40 bg-zinc-950' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-zinc-400'}`}>
                                        {format(day, dateFormat)}
                                    </span>
                                </div>

                                <div className="space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                                    {/* Partidos */}
                                    {dayPartidos.map(partido => (
                                        <div
                                            key={partido.id}
                                            onClick={() => navigate(`/partidos/${partido.id}/editar`)}
                                            className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-xs cursor-pointer hover:bg-amber-500/20 truncate font-medium flex items-center gap-1.5 transition-colors"
                                        >
                                            <Trophy className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{partido.rival || 'Partido'}</span>
                                        </div>
                                    ))}

                                    {/* Sesiones */}
                                    {daySesiones.map(sesion => (
                                        <div
                                            key={sesion.id}
                                            onClick={() => navigate(`/sesiones/${sesion.id}/ver`)}
                                            className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-xs cursor-pointer hover:bg-emerald-500/20 truncate font-medium flex items-center gap-1.5 transition-colors"
                                        >
                                            <CheckCircle className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{sesion.objetivos || 'Sesión'}</span>
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
