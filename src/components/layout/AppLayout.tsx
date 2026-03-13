import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ClipboardList,
    Target,
    Calendar,
    Trophy
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { user, coach, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Planificación', href: '/temporadas', icon: Calendar },
        { name: 'Biblioteca', href: '/ejercicios', icon: ClipboardList },
        { name: 'Porteros', href: '/porteros', icon: Target },
        { name: 'Partidos', href: '/partidos', icon: Trophy },
        { name: 'Jugadores', href: '/jugadores', icon: Users },
        { name: 'Ajustes', href: '/profile', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-500">

            {/* Mobile Top Bar */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-900/50 bg-black/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white italic text-xs">P5</div>
                    <span className="font-bold tracking-tighter text-xl uppercase">Pista5</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-zinc-900/50 bg-black fixed left-0 top-0 bottom-0 z-30">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-emerald-900/20">P5</div>
                        <div className="flex flex-col">
                            <span className="font-bold tracking-tighter text-xl leading-none uppercase">Pista5</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">SaaS Entrenamiento</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-emerald-500'}`} />
                                    <span className="font-medium">{item.name}</span>
                                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10 border border-zinc-800">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-emerald-600 text-white">
                                    {(coach?.nombre || coach?.email)?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0" title={coach?.nombre || ''}>
                                <span className="text-sm font-bold truncate">{coach?.nombre || user?.user_metadata?.full_name || 'Coach'}</span>
                                <span className="text-xs text-zinc-500 truncate">{coach?.email}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 border-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all rounded-xl h-11"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-zinc-950 z-50 flex flex-col p-6 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white italic text-xs">P5</div>
                            <span className="font-bold tracking-tighter text-xl uppercase">Pista5</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <nav className="space-y-2 mb-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium ${location.pathname === item.href
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-zinc-400 hover:bg-zinc-900'
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <Button
                        variant="outline"
                        className="w-full justify-center gap-2 border-zinc-800 text-zinc-400 h-14 rounded-2xl"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Cerrar Sesión</span>
                    </Button>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:pl-72 min-h-screen bg-black">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
