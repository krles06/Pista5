import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Trophy,
    ClipboardList,
    ArrowRight,
    TrendingUp,
    Target,
    CalendarDays,
    Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJugadores } from '@/hooks/useJugadores';
import { usePartidos } from '@/hooks/usePartidos';
import { useEjercicios } from '@/hooks/useEjercicios';
import { useActiveMicrociclo, useMacrociclos, useMesociclos, useMicrociclos } from '@/hooks/usePlanificacion';
import { useTemporadas } from '@/hooks/useTemporadas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { coach } = useAuth();
    const navigate = useNavigate();

    // Fetch data for stats
    const { data: jugadores } = useJugadores();
    const { data: partidos } = usePartidos();
    const { data: ejercicios } = useEjercicios();
    const { data: activeMicro, isLoading: loadingActiveMicro } = useActiveMicrociclo();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selTemporada, setSelTemporada] = useState<string | null>(null);
    const [selMacrociclo, setSelMacrociclo] = useState<string | null>(null);
    const [selMesociclo, setSelMesociclo] = useState<string | null>(null);
    const [selMicrociclo, setSelMicrociclo] = useState<string | null>(null);

    // Filtered data for selectors
    const { data: temporadas } = useTemporadas();
    const { data: macrociclos } = useMacrociclos(selTemporada || undefined);
    const { data: mesociclos } = useMesociclos(selMacrociclo || undefined);
    const { data: microciclos } = useMicrociclos(selMesociclo || undefined);

    // Auto-select active microcycle if exists
    useEffect(() => {
        if (activeMicro && isModalOpen) {
            const tempId = activeMicro.mesociclos?.macrociclos?.id_temporada;
            const macroId = activeMicro.mesociclos?.id_macrociclo;
            const mesoId = activeMicro.id_mesociclo;
            const microId = activeMicro.id;

            if (tempId) setSelTemporada(tempId);
            if (macroId) setSelMacrociclo(macroId);
            if (mesoId) setSelMesociclo(mesoId);
            if (microId) setSelMicrociclo(microId);
        }
    }, [activeMicro, isModalOpen]);

    const lastPartido = partidos?.[0];
    const nJugadores = jugadores?.length || 0;
    const nEjercicios = ejercicios?.length || 0;

    const handleCreateSession = () => {
        if (!selMicrociclo) return;
        navigate(`/sesiones/nueva?microciclo=${selMicrociclo}`);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-12">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 lg:p-12">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                            Panel de Control
                        </Badge>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground italic">
                            HOLA, {coach?.nombre?.split(' ')[0].toUpperCase() || 'COACH'}!
                        </h1>
                        <p className="text-muted-foreground max-w-lg font-medium">
                            Bienvenido de nuevo a <span className="text-emerald-500 font-bold italic">Pista5</span>.
                            Tienes todo listo para planificar la semana y analizar el rendimiento de tu equipo.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <Button
                            onClick={() => navigate('/temporadas')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 shadow-xl shadow-emerald-900/20"
                        >
                            PLANIFICACIÓN
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/ejercicios')}
                            className="border-border bg-muted text-foreground hover:text-foreground h-12"
                        >
                            EJERCICIOS
                        </Button>
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="JUGADORES"
                    value={nJugadores}
                    icon={Users}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="EJERCICIOS"
                    value={nEjercicios}
                    icon={ClipboardList}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    title="PARTIDOS"
                    value={partidos?.length || 0}
                    icon={Trophy}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="ASISTENCIA MEDIA"
                    value="92%"
                    icon={TrendingUp}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Result */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-emerald-500" />
                            Último Resultado
                        </h2>
                        <Button
                            variant="link"
                            className="text-emerald-500 font-bold p-0 h-auto"
                            onClick={() => navigate('/partidos')}
                        >
                            Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    {lastPartido ? (
                        <Card className="border-border bg-card/50 hover:bg-card transition-colors cursor-pointer group rounded-3xl overflow-hidden" onClick={() => navigate('/partidos')}>
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                        <div className="h-20 w-20 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:border-emerald-500/50 transition-all font-black text-2xl mb-1 italic">
                                            {lastPartido.condicion === 'local' ? 'P5' : lastPartido.rival?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-black text-foreground uppercase tracking-tighter">
                                            {lastPartido.condicion === 'local' ? 'Nosotros' : lastPartido.rival}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <Badge className="bg-muted text-muted-foreground border-border uppercase p-0.5 px-3 mb-2 font-black text-[9px] tracking-widest">
                                            {lastPartido.tipo_partido}
                                        </Badge>
                                        <div className="flex items-center gap-6">
                                            <span className="text-6xl font-black text-foreground italic">{lastPartido.goles_local}</span>
                                            <span className="text-2xl font-black text-muted-foreground">-</span>
                                            <span className="text-6xl font-black text-foreground italic">{lastPartido.goles_visitante}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">
                                            {format(new Date(lastPartido.fecha), "PPP", { locale: es })}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                        <div className="h-20 w-20 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:border-emerald-500/50 transition-all font-black text-2xl mb-1 italic">
                                            {lastPartido.condicion === 'visitante' ? 'P5' : lastPartido.rival?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-black text-foreground uppercase tracking-tighter">
                                            {lastPartido.condicion === 'visitante' ? 'Nosotros' : lastPartido.rival}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-card/20 text-muted-foreground">
                            No hay partidos registrados todavía.
                        </div>
                    )}
                </div>

                {/* Next Steps / Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2 px-2">
                        <Target className="h-5 w-5 text-emerald-500" />
                        Accesos Rápidos
                    </h2>
                    <div className="grid gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={loadingActiveMicro}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-600 border border-emerald-500 hover:bg-emerald-700 transition-all text-left group shadow-lg shadow-emerald-900/20"
                        >
                            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/30 transition-all shrink-0">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white text-sm italic underline-offset-4 decoration-white/30 group-hover:underline">NUEVA SESIÓN</p>
                                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-tight truncate">Crea tu entrenamiento</p>
                            </div>
                            <ArrowRight className="h-4 w-4 ml-auto text-white/50 group-hover:text-white transition-colors" />
                        </button>
                        <QuickAction
                            title="Calendario"
                            desc="Agenda global"
                            icon={CalendarDays}
                            href="/calendario"
                        />
                        <QuickAction
                            title="Plantilla"
                            desc="Gestiona tus jugadores"
                            icon={Users}
                            href="/jugadores"
                        />
                        <QuickAction
                            title="Planificar"
                            desc="Crea microciclos"
                            icon={Calendar}
                            href="/temporadas"
                        />
                        <QuickAction
                            title="Ejercicios"
                            desc="Explora ejercicios"
                            icon={ClipboardList}
                            href="/ejercicios"
                        />
                        <QuickAction
                            title="Porteros"
                            desc="Específicos"
                            icon={Target}
                            href="/porteros"
                        />
                    </div>
                </div>
            </div>

            {/* Session Selector Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-background border-border text-foreground sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic tracking-tight flex items-center gap-2">
                            <div className="h-8 w-8 bg-emerald-600 rounded flex items-center justify-center">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            NUEVA SESIÓN
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Temporada */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Temporada</Label>
                            <Select value={selTemporada || ''} onValueChange={(v) => { setSelTemporada(v); setSelMacrociclo(null); setSelMesociclo(null); setSelMicrociclo(null); }}>
                                <SelectTrigger className="bg-card border-border text-foreground h-10">
                                    <SelectValue placeholder="Selecciona temporada" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {temporadas?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.equipo} - {t.temporada}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Macrociclo */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Macrociclo</Label>
                            <Select
                                value={selMacrociclo || ''}
                                onValueChange={(v) => { setSelMacrociclo(v); setSelMesociclo(null); setSelMicrociclo(null); }}
                                disabled={!selTemporada}
                            >
                                <SelectTrigger className="bg-card border-border text-foreground h-10 disabled:opacity-30">
                                    <SelectValue placeholder="Selecciona macrociclo" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {macrociclos?.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mesociclo */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Mesociclo</Label>
                            <Select
                                value={selMesociclo || ''}
                                onValueChange={(v) => { setSelMesociclo(v); setSelMicrociclo(null); }}
                                disabled={!selMacrociclo}
                            >
                                <SelectTrigger className="bg-card border-border text-foreground h-10 disabled:opacity-30">
                                    <SelectValue placeholder="Selecciona mesociclo" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {mesociclos?.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Microciclo */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Microciclo</Label>
                            <Select
                                value={selMicrociclo || ''}
                                onValueChange={setSelMicrociclo}
                                disabled={!selMesociclo}
                            >
                                <SelectTrigger className="bg-card border-border text-foreground h-10 disabled:opacity-30">
                                    <SelectValue placeholder="Selecciona microciclo" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {microciclos?.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black italic tracking-tighter"
                            onClick={handleCreateSession}
                            disabled={!selMicrociclo}
                        >
                            CREAR SESIÓN
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-border bg-card/50 hover:bg-card transition-all group overflow-hidden rounded-3xl">
            <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                    <div className={`h-12 w-12 ${bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{title}</p>
                        <p className="text-3xl font-black text-foreground tracking-tight mt-1 italic">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function QuickAction({ title, desc, icon: Icon, href }: any) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(href)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-emerald-500/50 hover:bg-card/80 transition-all text-left group"
        >
            <div className="h-10 w-10 bg-background rounded-xl flex items-center justify-center border border-border group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all shrink-0">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-white" />
            </div>
            <div className="min-w-0">
                <p className="font-bold text-foreground text-sm italic">{title.toUpperCase()}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight truncate">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-emerald-500 transition-colors" />
        </button>
    );
}
