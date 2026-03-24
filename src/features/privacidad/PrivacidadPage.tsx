import { ArrowLeft, Eye, Lock, Database, UserX, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacidadPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-3xl space-y-8">
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground -ml-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">Política de Privacidad</h1>
                    <p className="text-muted-foreground font-medium">Última actualización: Marzo 2026</p>
                </div>

                <div className="space-y-6">
                    <Card className="border-border bg-card shadow-xl rounded-3xl overflow-hidden">
                        <CardContent className="p-8 space-y-8">

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Eye className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">1. Qué datos recogemos</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Recogemos únicamente los datos necesarios para el funcionamiento del servicio:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    <li><span className="text-foreground font-medium">Datos de cuenta:</span> nombre, dirección de email y contraseña (cifrada).</li>
                                    <li><span className="text-foreground font-medium">Datos de uso:</span> ejercicios, sesiones, jugadores, partidos y planificaciones que introduces tú mismo.</li>
                                    <li><span className="text-foreground font-medium">Datos técnicos:</span> registros de acceso para seguridad y diagnóstico de errores.</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Database className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">2. Cómo usamos tus datos</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Tus datos se usan exclusivamente para:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    <li>Prestarte el servicio de Pista5 (mostrar, guardar y gestionar tu contenido).</li>
                                    <li>Enviarte comunicaciones relacionadas con tu cuenta (confirmación de email, recuperación de contraseña).</li>
                                    <li>Mejorar la plataforma mediante análisis agregados y anónimos.</li>
                                </ul>
                                <p className="text-foreground font-bold italic mt-2">
                                    No vendemos, cedemos ni compartimos tus datos personales con terceros bajo ninguna circunstancia.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Lock className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">3. Seguridad</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Utilizamos <span className="text-foreground font-medium">Supabase</span> como infraestructura de base de datos y autenticación. Todos los datos se almacenan cifrados en reposo y en tránsito mediante TLS. Las contraseñas nunca se almacenan en texto plano. El acceso a los datos está protegido mediante políticas de seguridad a nivel de fila (Row Level Security).
                                </p>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Globe className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">4. Cookies y seguimiento</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Pista5 utiliza únicamente las cookies técnicas necesarias para mantener tu sesión activa. No usamos cookies de seguimiento publicitario ni compartimos datos de navegación con redes publicitarias.
                                    <br /><br />
                                    Podemos utilizar <span className="text-foreground font-medium">Plausible Analytics</span>, una herramienta de análisis de uso respetuosa con la privacidad que no recoge datos personales ni utiliza cookies de seguimiento.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <UserX className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">5. Tus derechos (GDPR / LOPD)</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    De acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos (LOPD), tienes los siguientes derechos:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    <li><span className="text-foreground font-medium">Acceso:</span> solicitar una copia de los datos que tenemos sobre ti.</li>
                                    <li><span className="text-foreground font-medium">Rectificación:</span> corregir datos incorrectos desde tu perfil o contactándonos.</li>
                                    <li><span className="text-foreground font-medium">Supresión:</span> eliminar tu cuenta y todos tus datos desde la sección «Zona de peligro» de tu perfil.</li>
                                    <li><span className="text-foreground font-medium">Portabilidad:</span> solicitar tus datos en formato exportable contactando con nosotros.</li>
                                    <li><span className="text-foreground font-medium">Oposición:</span> oponerte a determinados tratamientos de tus datos.</li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed mt-2">
                                    Para ejercer cualquiera de estos derechos, escríbenos a{' '}
                                    <a href="mailto:pista5.app@outlook.com" className="text-emerald-500 font-bold italic">pista5.app@outlook.com</a>.
                                    Responderemos en un plazo máximo de 30 días.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Database className="h-6 w-6" />
                                    <h2 className="text-xl font-black italic uppercase tracking-tight">6. Retención de datos</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, todos tus datos personales y de entrenamiento serán eliminados permanentemente en un plazo de 30 días, salvo obligación legal de conservación.
                                </p>
                            </section>

                            <div className="pt-8 border-t border-border">
                                <p className="text-muted-foreground text-sm">
                                    Responsable del tratamiento: <span className="text-foreground font-medium">Pista5</span> — Para cualquier consulta sobre privacidad:{' '}
                                    <a href="mailto:pista5.app@outlook.com" className="text-emerald-500 font-bold italic">pista5.app@outlook.com</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-muted-foreground text-xs font-bold uppercase tracking-widest pb-12">
                    Pista5 — Tu pizarra digital de fútbol sala
                </p>
            </div>
        </div>
    );
}
