import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, X, User } from 'lucide-react';
import { getSignedStorageUrl } from '@/lib/utils';

import { useJugador, useCreateJugador, useUpdateJugador } from '@/hooks/useJugadores';
import { useTemporadas } from '@/hooks/useTemporadas';
import type { JugadorInsert } from '@/lib/types-jugadores';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const POSICIONES = [
    'Portero',
    'Cierre',
    'Ala Diestro',
    'Ala Zurdo',
    'Pívot',
    'Universal'
];

export default function JugadorForm() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const seasonIdParam = searchParams.get('temporada');
    const isEditing = !!id;
    const navigate = useNavigate();

    const { data: jugador, isLoading: loadingJugador } = useJugador(id);
    const { data: temporadas } = useTemporadas();
    const createMutation = useCreateJugador();
    const updateMutation = useUpdateJugador();

    const [formData, setFormData] = useState<JugadorInsert>({
        nombre: '',
        apellidos: '',
        id_temporada: seasonIdParam || undefined,
        posicion: 'Universal',
        fecha_nacimiento: '',
        dorsal: null,
        telefono: '',
        email: '',
        lesionado: false,
        notas: '',
        url_foto: null
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && jugador) {
            setFormData({
                nombre: jugador.nombre,
                apellidos: jugador.apellidos || '',
                id_temporada: (jugador as any).id_temporada || undefined,
                posicion: jugador.posicion || 'Universal',
                fecha_nacimiento: jugador.fecha_nacimiento || '',
                dorsal: jugador.dorsal,
                telefono: jugador.telefono || '',
                email: jugador.email || '',
                lesionado: jugador.lesionado,
                notas: jugador.notas || '',
                url_foto: jugador.url_foto
            });
            if (jugador.url_foto) {
                const url = jugador.url_foto.startsWith('http') ? jugador.url_foto : null;
                if (url) setPhotoPreview(url);
                else getSignedStorageUrl('jugadores-fotos', jugador.url_foto).then(setPhotoPreview);
            }
        } else if (!isEditing && seasonIdParam) {
            setFormData(prev => ({ ...prev, id_temporada: seasonIdParam }));
        }
    }, [isEditing, jugador, seasonIdParam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'dorsal') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const clearPhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setFormData(prev => ({ ...prev, url_foto: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre) {
            toast.error('El nombre es obligatorio');
            return;
        }

        try {
            const payload = {
                ...formData,
                fecha_nacimiento: formData.fecha_nacimiento || null,
                apellidos: formData.apellidos || null,
                telefono: formData.telefono || null,
                email: formData.email || null,
                notas: formData.notas || null,
            };

            if (isEditing && id) {
                await updateMutation.mutateAsync({ id, updates: payload, photoFile: photoFile || undefined });
                toast.success('Perfil actualizado');
            } else {
                await createMutation.mutateAsync({ jugador: payload, photoFile: photoFile || undefined });
                toast.success('Jugador añadido');
            }
            navigate(formData.id_temporada ? `/temporadas/${formData.id_temporada}/jugadores` : '/jugadores');
        } catch (err: any) {
            toast.error('Error al guardar: ' + err.message);
        }
    };

    if (isEditing && loadingJugador) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => navigate(-1)}
                    className="border-border bg-card text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar Jugador' : 'Nuevo Jugador'}
                    </h1>
                    <p className="text-muted-foreground">Completa la ficha técnica y personal del jugador.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Foto y Estado - Sidebar Left */}
                <div className="space-y-6">
                    <Card className="border-border bg-card shadow-xl overflow-hidden">
                        <CardHeader className="p-4 border-b border-border text-center">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fotografía</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center">
                            <div
                                className="w-32 h-32 rounded-full bg-background border-2 border-dashed border-border flex items-center justify-center overflow-hidden mb-4 group relative cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="h-6 w-6 text-emerald-500" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" className="border-border text-xs text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                                    {photoPreview ? 'Cambiar' : 'Subir foto'}
                                </Button>
                                {photoPreview && (
                                    <Button type="button" variant="ghost" size="sm" className="text-xs text-red-500" onClick={clearPhoto}>
                                        <X className="h-3 w-3 mr-1" /> Quitar
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="lesionado" className="text-foreground">Lesionado</Label>
                                    <p className="text-xs text-muted-foreground">No disponible para jugar</p>
                                </div>
                                <Switch
                                    id="lesionado"
                                    checked={formData.lesionado}
                                    onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, lesionado: checked }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Form Data - Center/Right */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border bg-card shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground">Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="text-foreground">Nombre *</Label>
                                    <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="bg-background border-border" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellidos" className="text-foreground">Apellidos</Label>
                                    <Input id="apellidos" name="apellidos" value={formData.apellidos || ''} onChange={handleChange} className="bg-background border-border" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="temporada" className="text-foreground">Temporada</Label>
                                <Select
                                    value={formData.id_temporada || 'none'}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, id_temporada: v === 'none' ? null : v }))}
                                >
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Sin temporada (global)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        <SelectItem value="none">Sin temporada (global)</SelectItem>
                                        {temporadas?.map(t => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.equipo} - {t.temporada}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="posicion" className="text-foreground">Posición Principal</Label>
                                    <Select value={formData.posicion || 'Universal'} onValueChange={(v) => setFormData(prev => ({ ...prev, posicion: v }))}>
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="Selecciona..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border text-foreground">
                                            {POSICIONES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dorsal" className="text-foreground">Dorsal</Label>
                                    <Input id="dorsal" name="dorsal" type="number" value={formData.dorsal || ''} onChange={handleChange} className="bg-background border-border" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fecha_nacimiento" className="text-foreground">Fecha de Nacimiento</Label>
                                <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento || ''} onChange={handleChange} className="bg-background border-border [color-scheme:dark]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground">Contacto y Notas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefono" className="text-foreground">Teléfono</Label>
                                    <Input id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleChange} className="bg-background border-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground">Email</Label>
                                    <Input id="email" name="email" value={formData.email || ''} onChange={handleChange} className="bg-background border-border" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notas" className="text-foreground">Observaciones Técnicas / Notas</Label>
                                <Textarea id="notas" name="notas" value={formData.notas || ''} onChange={handleChange} className="bg-background border-border min-h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-border text-muted-foreground hover:text-foreground">
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : (
                                <>
                                    <Save className="h-4 w-4 mr-2" /> Guardar Jugador
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
