import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    ClipboardList,
    Target,
    Calendar,
    CalendarDays,
    Trophy,
    Phone,
    FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BottomNav from './BottomNav';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { user, coach, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Calendario', href: '/calendario', icon: CalendarDays },
        { name: 'Planificación', href: '/temporadas', icon: Calendar },
        { name: 'Ejercicios', href: '/ejercicios', icon: ClipboardList },
        { name: 'Porteros', href: '/porteros', icon: Target },
        { name: 'Partidos', href: '/partidos', icon: Trophy },
        { name: 'Jugadores', href: '/jugadores', icon: Users },
        { name: 'Ajustes', href: '/profile', icon: Settings },
    ];

    const footerItems = [
        { name: 'Contacto', href: '/contacto', icon: Phone },
        { name: 'Términos', href: '/terminos', icon: FileText },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30 selection:text-emerald-500">

            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white italic text-xs">P5</div>
                    <span className="font-bold tracking-tighter text-xl uppercase">Pista5</span>
                </div>
                {/* Secondary Actions for Mobile */}
                <div className="flex items-center gap-2">
                    <Link to="/profile">
                        <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-emerald-600 text-white text-[10px]">
                                {(coach?.nombre || coach?.email)?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-border/50 bg-background fixed left-0 top-0 bottom-0 z-30">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-emerald-900/20">P5</div>
                        <div className="flex flex-col">
                            <span className="font-bold tracking-tighter text-xl leading-none uppercase">Pista5</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">SaaS Entrenamiento</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-emerald-500'}`} />
                                    <span className="font-medium">{item.name}</span>
                                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <nav className="mt-8 pt-8 border-t border-border/50 space-y-1">
                        {footerItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'text-emerald-500'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-emerald-600 text-white">
                                    {(coach?.nombre || coach?.email)?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0" title={coach?.nombre || ''}>
                                <span className="text-sm font-bold truncate">{coach?.nombre || user?.user_metadata?.full_name || 'Coach'}</span>
                                <span className="text-xs text-muted-foreground truncate">{coach?.email}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all rounded-xl h-11"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* No secondary overlay needed since we have BottomNav, but keeping code for reference if needed or removing it */}

            {/* Main Content */}
            <main className="md:pl-64 lg:pl-72 min-h-screen bg-background pb-20 md:pb-0">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
