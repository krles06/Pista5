import { Link } from 'react-router-dom';
import { LayoutGrid, Calendar, Users, Trophy, BarChart2, FileText, ChevronRight, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
    {
        icon: LayoutGrid,
        title: 'Biblioteca de ejercicios',
        desc: 'Crea y organiza tu propio catálogo de ejercicios con imágenes, categorías, dificultad y parámetros técnicos.',
    },
    {
        icon: Calendar,
        title: 'Planificación periódica',
        desc: 'Estructura tus temporadas con macrociclos, mesociclos y microciclos como un cuerpo técnico de élite.',
    },
    {
        icon: FileText,
        title: 'Sesiones profesionales',
        desc: 'Diseña sesiones completas arrastrando ejercicios, añade notas y genera PDFs listos para imprimir.',
    },
    {
        icon: Users,
        title: 'Gestión de jugadores',
        desc: 'Ficha completa de cada jugador, control de asistencia y seguimiento individual por temporada.',
    },
    {
        icon: Trophy,
        title: 'Calendario y partidos',
        desc: 'Registra resultados, alineaciones y datos de cada partido. Analiza el rendimiento competitivo.',
    },
    {
        icon: BarChart2,
        title: 'Dashboard inteligente',
        desc: 'Vista rápida de tus métricas clave: sesiones completadas, asistencia media y próximos eventos.',
    },
];

const benefits = [
    'Todo en un solo lugar, sin Excel ni cuadernos',
    'Acceso desde cualquier dispositivo',
    'Tus datos son tuyos — nunca los compartimos',
    'Diseñado específicamente para fútbol sala',
    'Genera PDFs de sesiones en segundos',
    'Soporte directo con el equipo de Pista5',
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* NAV */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/P5-LogoS.png" alt="Pista5" className="h-8 w-8 rounded-lg" />
                        <span className="text-xl font-black tracking-tighter italic uppercase">Pista5</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                Iniciar sesión
                            </Button>
                        </Link>
                        <Link to="/contacto">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                Solicitar acceso
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="relative pt-32 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ERP para entrenadores de fútbol sala
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-[0.9]">
                        Entrena como<br />
                        <span className="text-emerald-500">los mejores</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Pista5 es la plataforma todo-en-uno para entrenadores de fútbol sala profesionales. Planifica temporadas, gestiona jugadores y diseña sesiones en minutos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contacto">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-8 shadow-lg shadow-emerald-600/20">
                                Solicitar acceso <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="border-border h-12 px-8 font-bold text-foreground hover:bg-muted">
                                Ya tengo cuenta
                            </Button>
                        </Link>
                    </div>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">
                        Acceso gestionado — escríbenos para comenzar
                    </p>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-24 px-4 border-t border-border/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Funcionalidades</p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase">Todo lo que necesitas</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">Diseñado desde cero para las necesidades reales de un entrenador de fútbol sala.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="group p-6 bg-card border border-border rounded-2xl hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                                <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600/20 transition-colors">
                                    <f.icon className="h-5 w-5 text-emerald-500" />
                                </div>
                                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="py-24 px-4 bg-card/30 border-y border-border/50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Por qué Pista5</p>
                        <h2 className="text-4xl font-black tracking-tighter italic uppercase">Hecho para<br />entrenadores,<br />no para IT</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Olvidamos los Excel complicados y los cuadernos perdidos. Pista5 es intuitivo, rápido y funciona en móvil y escritorio.
                        </p>
                    </div>
                    <ul className="space-y-4">
                        {benefits.map((b) => (
                            <li key={b} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-foreground font-medium">{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Mail className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase">¿Listo para<br />subir de nivel?</h2>
                    <p className="text-muted-foreground text-lg">
                        El acceso a Pista5 es gestionado. Escríbenos y te damos de alta personalmente.
                    </p>
                    <Link to="/contacto">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-10 shadow-lg shadow-emerald-600/20">
                            Solicitar acceso <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-border/50 py-10 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/P5-LogoS.png" alt="Pista5" className="h-6 w-6 rounded-md" />
                        <span className="font-black tracking-tighter italic uppercase text-sm">Pista5</span>
                        <span className="text-muted-foreground/40 text-xs ml-2">© {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        <Link to="/contacto" className="hover:text-emerald-500 transition-colors">Contacto</Link>
                        <Link to="/terminos" className="hover:text-emerald-500 transition-colors">Términos</Link>
                        <Link to="/privacidad" className="hover:text-emerald-500 transition-colors">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
