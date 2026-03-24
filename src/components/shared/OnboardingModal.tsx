import { useState, useEffect } from 'react';
import { Activity, LayoutGrid, Calendar, Users, Trophy, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'pista5_onboarding_done';

const steps = [
    {
        icon: Activity,
        title: '¡Bienvenido a Pista5!',
        desc: 'Tu pizarra digital de fútbol sala. Te mostramos en 4 pasos cómo sacarle el máximo partido.',
    },
    {
        icon: LayoutGrid,
        title: 'Empieza por los ejercicios',
        desc: 'Ve a «Ejercicios» y crea tu biblioteca personal. Puedes añadir imágenes, categorías y parámetros técnicos.',
    },
    {
        icon: Calendar,
        title: 'Planifica tu temporada',
        desc: 'En «Temporadas» crea la temporada actual y estructura tus macrociclos, mesociclos y microciclos.',
    },
    {
        icon: Users,
        title: 'Gestiona tus jugadores',
        desc: 'Añade a tus jugadores, lleva el control de asistencia y consulta su historial de sesiones.',
    },
    {
        icon: Trophy,
        title: '¡Ya estás listo!',
        desc: 'Si necesitas ayuda en cualquier momento, escríbenos a pista5.app@outlook.com. ¡Mucho éxito!',
    },
];

export function OnboardingModal() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!localStorage.getItem(ONBOARDING_KEY)) {
            setOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_KEY, '1');
        setOpen(false);
    };

    if (!open) return null;

    const current = steps[step];
    const Icon = current.icon;
    const isLast = step === steps.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <Icon className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black tracking-tight italic uppercase text-foreground">
                        {current.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{current.desc}</p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(i)}
                            className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-border'}`}
                        />
                    ))}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        className="flex-1 text-muted-foreground"
                        onClick={handleClose}
                    >
                        Saltar
                    </Button>
                    <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        onClick={handleNext}
                    >
                        {isLast ? '¡Empezar!' : 'Siguiente'}
                        {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
