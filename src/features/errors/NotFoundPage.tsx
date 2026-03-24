import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[128px] pointer-events-none" />
            <div className="text-center space-y-6 relative z-10">
                <div className="flex justify-center">
                    <div className="bg-emerald-600/10 p-4 rounded-2xl border border-emerald-500/10">
                        <Activity className="h-10 w-10 text-emerald-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-8xl font-black tracking-tighter italic text-emerald-500">404</p>
                    <h1 className="text-2xl font-black tracking-tight italic uppercase text-foreground">Página no encontrada</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Esta página no existe o ha sido movida. Vuelve al inicio para continuar.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
                        </Button>
                    </Link>
                    <Link to="/contacto">
                        <Button variant="outline" className="border-border font-bold">
                            Contactar soporte
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
