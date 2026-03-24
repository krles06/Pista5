import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    Calendar,
    ShieldAlert,
    ShieldCheck,
    Clipboard,
    User,
    Star
} from 'lucide-react';

import { useJugador } from '@/hooks/useJugadores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StorageAvatarImage } from '@/components/ui/storage-image';
import { Separator } from '@/components/ui/separator';

export default function JugadorDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: j, isLoading } = useJugador(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!j) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Jugador no encontrado.
                <Button variant="link" onClick={() => navigate('/jugadores')}>Volver al listado</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header Profile Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-4">
                <Avatar className="h-32 w-32 border-4 border-zinc-900 shadow-2xl ring-2 ring-zinc-800">
                    <StorageAvatarImage path={j.url_foto} bucket="jugadores-fotos" className="object-cover" />
                    <AvatarFallback className="bg-card text-emerald-500 text-4xl font-bold">
                        {j.nombre[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h1 className="text-4xl font-bold text-foreground">
                            {j.nombre} {j.apellidos}
                        </h1>
                        <Badge className="bg-emerald-500 text-white font-bold text-lg h-10 w-10 justify-center rounded-lg shadow-lg self-center sm:self-auto">
                            {j.dorsal || '--'}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-xs font-bold text-emerald-500">
                            <Star className="h-3.5 w-3.5" /> {j.posicion || 'Universal'}
                        </div>
                        {j.fecha_nacimiento && (
                            <div className="flex items-center gap-1.5 text-sm">
                                <Calendar className="h-4 w-4" /> {format(new Date(j.fecha_nacimiento), 'd MMM yyyy', { locale: es })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="icon" type="button" onClick={() => navigate(-1)} className="border-border bg-card text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => navigate(`/jugadores/${j.id}/editar`)} className="bg-foreground text-background hover:bg-white border-zinc-200">
                        <Edit className="h-4 w-4 mr-2" /> Editar Perfil
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column - Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-border bg-card shadow-xl overflow-hidden">
                        <div className={`h-1.5 w-full ${j.lesionado ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${j.lesionado ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {j.lesionado ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Estado disponibilidad</p>
                                    <p className={`font-bold ${j.lesionado ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {j.lesionado ? 'Lesionado / Baja' : 'Disponible / Alta'}
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-muted mb-6" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</p>
                                        <p className="text-sm text-foreground">{j.telefono || 'No disponible'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                                        <p className="text-sm text-foreground font-medium truncate max-w-[150px]">{j.email || 'No disponible'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Stats/Notes */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border bg-card shadow-xl">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Clipboard className="h-5 w-5 text-emerald-500" /> Observaciones Técnicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                {j.notas || 'No se han añadido notas técnicas para este jugador todavía.'}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
                            <User className="h-8 w-8 text-muted-foreground mb-2" />
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Partidos jugados</h4>
                            <p className="text-3xl font-bold text-foreground mt-1">--</p>
                        </Card>
                        <Card className="border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="h-8 w-8 text-muted-foreground mb-2" />
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Asistencia entreno</h4>
                            <p className="text-3xl font-bold text-foreground mt-1">--%</p>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
