import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactoPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-zinc-50 -ml-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-50 italic">CONTACTO</h1>
                    <p className="text-zinc-400 font-medium">
                        ¿Tienes alguna duda o sugerencia? Estamos aquí para ayudarte.
                    </p>
                </div>

                <Card className="border-zinc-800 bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Mail className="h-8 w-8 text-emerald-500" />
                        </div>

                        <div className="space-y-4">
                            <p className="text-zinc-300">
                                Para cualquier consulta, sugerencia o incidencia, puedes escribirnos a:
                            </p>

                            <a
                                href="mailto:pista5.app@outlook.com"
                                className="block text-2xl font-black text-emerald-500 italic hover:scale-105 transition-transform"
                            >
                                pista5.app@outlook.com
                            </a>

                            <p className="text-sm text-zinc-500 font-medium">
                                Te responderemos en un plazo de 24-48 horas.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
                    Pista5 — Tu pizarra digital de fútbol sala
                </p>
            </div>
        </div>
    );
}
