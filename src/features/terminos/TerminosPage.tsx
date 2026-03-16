import { ArrowLeft, ShieldCheck, Database, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function TerminosPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-3xl space-y-8">
                <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-zinc-50 -ml-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-50 italic uppercase">Términos y Condiciones</h1>
                    <p className="text-zinc-400 font-medium">
                        Última actualización: Marzo 2026
                    </p>
                </div>

                <div className="space-y-6">
                    <Card className="border-zinc-800 bg-zinc-900 shadow-xl rounded-3xl overflow-hidden">
                        <CardContent className="p-8 space-y-8">

                            {/* Uso */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <FileText className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">1. Uso de la plataforma</h2>
                                </div>
                                <p className="text-zinc-400 leading-relaxed">
                                    Pista5 es una herramienta diseñada para entrenadores y profesionales del deporte. El acceso y uso de la plataforma es personal e intransferible. El usuario se compromete a hacer un uso lícito y adecuado de las herramientas proporcionadas.
                                </p>
                            </section>

                            {/* Privacidad */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <ShieldCheck className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">2. Privacidad de datos</h2>
                                </div>
                                <p className="text-zinc-400 leading-relaxed">
                                    En Pista5 nos tomamos muy en serio la seguridad. Todos los datos introducidos (jugadores, estadísticas, datos personales) pertenecen exclusivamente al entrenador.
                                    <span className="text-zinc-200 font-bold block mt-2 italic">
                                        No compartimos ni vendemos tus datos a terceros bajo ninguna circunstancia.
                                    </span>
                                </p>
                            </section>

                            {/* Propiedad */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Database className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">3. Propiedad del contenido</h2>
                                </div>
                                <p className="text-zinc-400 leading-relaxed">
                                    Los ejercicios, sesiones y planificaciones creadas por el usuario son de su propiedad intelectual. Pista5 actúa únicamente como soporte digital para el almacenamiento y gestión de dicho contenido.
                                </p>
                            </section>

                            {/* Responsabilidad */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Scale className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">4. Limitación de responsabilidad</h2>
                                </div>
                                <p className="text-zinc-400 leading-relaxed">
                                    Pista5 no se hace responsable de las lesiones, daños o resultados deportivos derivados del uso de la información o ejercicios almacenados en la plataforma. El uso de la herramienta es bajo la responsabilidad del profesional.
                                </p>
                            </section>

                            {/* Contacto */}
                            <div className="pt-8 border-t border-zinc-800">
                                <p className="text-zinc-400 text-sm">
                                    Para cualquier duda legal o aclaración sobre estos términos, puedes escribirnos a:
                                    <a href="mailto:pista5.app@outlook.com" className="text-emerald-500 font-bold ml-2 italic">pista5.app@outlook.com</a>
                                </p>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-zinc-600 text-xs font-bold uppercase tracking-widest pb-12">
                    Pista5 — Tu pizarra digital de fútbol sala
                </p>
            </div>
        </div>
    );
}
