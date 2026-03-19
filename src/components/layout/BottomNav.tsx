import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Dumbbell, ClipboardList, Users } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Planificación', href: '/temporadas', icon: Calendar },
        { name: 'Ejercicios', href: '/ejercicios', icon: Dumbbell },
        { name: 'Sesiones', href: '/calendario', icon: ClipboardList },
        { name: 'Jugadores', href: '/jugadores', icon: Users },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 py-3 md:hidden">
            {navItems.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 ${
                            isActive ? 'text-emerald-500' : 'text-muted-foreground'
                        }`}
                    >
                        <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10' : ''}`}>
                            <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
