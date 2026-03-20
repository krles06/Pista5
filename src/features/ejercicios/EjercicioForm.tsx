import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { CategorySelect } from '@/components/ui/CategorySelect';

import { useCreateEjercicio, useUpdateEjercicio, useEjercicio } from '@/hooks/useEjercicios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TIPO_TAREA,
    TIPO_TRABAJO,
    TRABAJO,
    COMPONENTE_JUEGO,
    SISTEMA_JUEGO,
    DIFICULTAD,
    TRABAJO_FISICO_INTEGRADO,
    NUMERO_JUGADORES
} from '@/lib/constants';

const ETAPAS_SESION = [
    'Calentamiento',
    'Parte Principal',
    'Vuelta a la Calma',
    'Tarea Genérica'
];

interface EjercicioFormProps {
    esPorteros?: boolean;
}

export default function EjercicioForm({ esPorteros = false }: EjercicioFormProps) {
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const navigate = useNavigate();
    const { data: ejercicio, isLoading: isFetching } = useEjercicio(id);
    const createMutation = useCreateEjercicio();
    const updateMutation = useUpdateEjercicio();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        objetivo_principal: '',
        objetivos_secundarios: '',
        descripcion: '',
        reglas: '',
        dimensiones: '',
        material: '',
        duracion_minutos: '',
        n_jugadores: '',
        etapa_sesion: 'Parte Principal',
        tipo_tarea: '',
        tipo_trabajo: '',
        trabajo: '',
        componente_juego: '',
        sistema_juego: '',
        dificultad: '',
        trabajo_fisico_integrado: '',
        url_video: '',
        es_portero: esPorteros,
    });

    useEffect(() => {
        if (isEditing && ejercicio) {
            setFormData({
                titulo: ejercicio.titulo || '',
                objetivo_principal: ejercicio.objetivo_principal || '',
                objetivos_secundarios: ejercicio.objetivos_secundarios || '',
                descripcion: ejercicio.descripcion || '',
                reglas: ejercicio.reglas || '',
                dimensiones: ejercicio.dimensiones || '',
                material: ejercicio.material || '',
                duracion_minutos: ejercicio.duracion_minutos ? String(ejercicio.duracion_minutos) : '',
                n_jugadores: ejercicio.n_jugadores ? String(ejercicio.n_jugadores) : '',
                etapa_sesion: ejercicio.etapa_sesion || 'Parte Principal',
                tipo_tarea: ejercicio.tipo_tarea || '',
                tipo_trabajo: ejercicio.tipo_trabajo || '',
                trabajo: ejercicio.trabajo || '',
                componente_juego: ejercicio.componente_juego || '',
                sistema_juego: ejercicio.sistema_juego || '',
                dificultad: ejercicio.dificultad || '',
                trabajo_fisico_integrado: ejercicio.trabajo_fisico_integrado || '',
                url_video: ejercicio.url_video || '',
                es_portero: ejercicio.es_portero,
            });
            if (ejercicio.url_imagen || ejercicio.fichero_imagen) {
                setImagePreview(ejercicio.url_imagen || ejercicio.fichero_imagen);
            }
        }
    }, [isEditing, ejercicio]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
        if (!file) {
            setImagePreview(null);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            duracion_minutos: formData.duracion_minutos ? parseInt(formData.duracion_minutos) : null,
            n_jugadores: formData.n_jugadores ? parseInt(formData.n_jugadores) : null,
            // Si estamos editando y quitamos la imagen (imagePreview es null y no hay imageFile nuevo), ponemos url_imagen a null
            ...(isEditing && !imagePreview && !imageFile ? { url_imagen: null } : {})
        } as any;

        try {
            if (isEditing && id) {
                await updateMutation.mutateAsync({
                    id,
                    updates: payload,
                    imageFile: imageFile || undefined
                });
                toast.success('Ejercicio actualizado correctamente');
            } else {
                await createMutation.mutateAsync({
                    ejercicio: payload,
                    imageFile: imageFile || undefined
                });
                toast.success('Ejercicio creado correctamente');
            }
            navigate(esPorteros ? '/porteros' : '/ejercicios');
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message);
        }
    };

    if (isEditing && isFetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;
    const basePath = esPorteros ? '/porteros' : '/ejercicios';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(basePath)}
                    className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                        {esPorteros && <span className="ml-3 text-sm font-normal text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Porteros</span>}
                    </h1>
                    <p className="text-muted-foreground">
                        Completa los detalles de esta tarea técnica o táctica.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border bg-card shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-foreground">Información Principal</CardTitle>
                                <CardDescription className="text-muted-foreground">Nombres, objetivos y explicación descriptiva.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="titulo" className="text-foreground">Título del ejercicio *</Label>
                                    <Input
                                        id="titulo" name="titulo"
                                        placeholder="Ej: Rondo 4v1, Posesión 6v6 con comodines..."
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className="bg-background border-border focus-visible:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="etapa_sesion" className="text-foreground">Etapa de la sesión *</Label>
                                        <Select value={formData.etapa_sesion} onValueChange={(v) => handleSelectChange('etapa_sesion', v)}>
                                            <SelectTrigger className="bg-background border-border text-foreground">
                                                <SelectValue placeholder="Selecciona la etapa" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground">
                                                {ETAPAS_SESION.map((etapa) => (
                                                    <SelectItem key={etapa} value={etapa}>{etapa}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 flex items-center pt-8 gap-2">
                                        <Checkbox
                                            id="es_portero"
                                            checked={formData.es_portero}
                                            onCheckedChange={(c) => setFormData((prev: any) => ({ ...prev, es_portero: !!c }))}
                                            className="border-border data-[state=checked]:bg-emerald-600"
                                        />
                                        <Label htmlFor="es_portero" className="text-foreground font-normal leading-none cursor-pointer">
                                            Específico para porteros
                                        </Label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="objetivo_principal" className="text-foreground">Objetivo Principal</Label>
                                        <Input
                                            id="objetivo_principal" name="objetivo_principal"
                                            placeholder="Ej: Mejora del pase de seguridad"
                                            value={formData.objetivo_principal}
                                            onChange={handleChange}
                                            className="bg-background border-border focus-visible:ring-emerald-500"
                                        />
                                    </div>

                                    <CategorySelect
                                        campo="tipo_tarea"
                                        label="Tipo de Tarea"
                                        value={formData.tipo_tarea}
                                        onChange={(v) => handleSelectChange('tipo_tarea', v)}
                                        staticOptions={TIPO_TAREA}
                                        placeholder="Selecciona tipo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descripcion" className="text-foreground">Descripción detallada</Label>
                                    <Textarea
                                        id="descripcion" name="descripcion"
                                        placeholder="Explica el funcionamiento del ejercicio..."
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        className="min-h-[120px] bg-background border-border focus-visible:ring-emerald-500 placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reglas" className="text-foreground">Reglas y consignas</Label>
                                    <Textarea
                                        id="reglas" name="reglas"
                                        placeholder="Restricciones de toques, puntuaciones especiales..."
                                        value={formData.reglas}
                                        onChange={handleChange}
                                        className="min-h-[80px] bg-background border-border focus-visible:ring-emerald-500 placeholder:text-muted-foreground"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="border-border bg-card shadow-xl lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-xl text-foreground">Categorización</CardTitle>
                                    <CardDescription className="text-muted-foreground">Define los aspectos técnicos y tácticos de la tarea.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <CategorySelect
                                        campo="tipo_trabajo"
                                        label="Tipo de Trabajo"
                                        value={formData.tipo_trabajo}
                                        onChange={(v) => handleSelectChange('tipo_trabajo', v)}
                                        staticOptions={TIPO_TRABAJO}
                                        placeholder="Selecciona trabajo"
                                    />

                                    <CategorySelect
                                        campo="trabajo"
                                        label="Trabajo Específico"
                                        value={formData.trabajo}
                                        onChange={(v) => handleSelectChange('trabajo', v)}
                                        staticOptions={TRABAJO}
                                        placeholder="Selecciona fase"
                                    />

                                    <CategorySelect
                                        campo="componente_juego"
                                        label="Componente del Juego"
                                        value={formData.componente_juego}
                                        onChange={(v) => handleSelectChange('componente_juego', v)}
                                        staticOptions={COMPONENTE_JUEGO}
                                        placeholder="Selecciona componente"
                                    />

                                    <CategorySelect
                                        campo="sistema_juego"
                                        label="Sistema de Juego"
                                        value={formData.sistema_juego}
                                        onChange={(v) => handleSelectChange('sistema_juego', v)}
                                        staticOptions={SISTEMA_JUEGO}
                                        placeholder="Selecciona sistema"
                                    />

                                    <CategorySelect
                                        campo="dificultad"
                                        label="Dificultad"
                                        value={formData.dificultad}
                                        onChange={(v) => handleSelectChange('dificultad', v)}
                                        staticOptions={DIFICULTAD}
                                        placeholder="Selecciona dificultad"
                                    />

                                    <CategorySelect
                                        campo="trabajo_fisico_integrado"
                                        label="Trabajo Físico Integrado"
                                        value={formData.trabajo_fisico_integrado}
                                        onChange={(v) => handleSelectChange('trabajo_fisico_integrado', v)}
                                        staticOptions={TRABAJO_FISICO_INTEGRADO}
                                        placeholder="Selecciona físico"
                                    />
                                </CardContent>
                            </Card>

                            <div className="space-y-6 lg:col-span-1">
                                <Card className="border-border bg-card shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-foreground">Parámetros</CardTitle>
                                        <CardDescription className="text-muted-foreground">Organización y tiempos.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="duracion_minutos" className="text-foreground">Duración (min)</Label>
                                            <Input
                                                type="number" id="duracion_minutos" name="duracion_minutos"
                                                placeholder="Ej: 15"
                                                value={formData.duracion_minutos}
                                                onChange={handleChange}
                                                className="bg-background border-border focus-visible:ring-emerald-500"
                                                min="1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="n_jugadores" className="text-foreground">Nº Jugadores</Label>
                                            <Select value={formData.n_jugadores} onValueChange={(v) => handleSelectChange('n_jugadores', v)}>
                                                <SelectTrigger className="bg-background border-border text-foreground">
                                                    <SelectValue placeholder="Nº Jug." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border text-foreground">
                                                    {NUMERO_JUGADORES.map((num) => (
                                                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dimensiones" className="text-foreground">Dimensiones</Label>
                                            <Input
                                                id="dimensiones" name="dimensiones"
                                                placeholder="Ej: 20x20m"
                                                value={formData.dimensiones}
                                                onChange={handleChange}
                                                className="bg-background border-border focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-border bg-card shadow-xl overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                                <ImageUpload
                                    value={imagePreview}
                                    onChange={handleImageChange}
                                    onRemove={clearImage}
                                />

                                <div className="space-y-2 pt-2 border-t border-border">
                                    <Label htmlFor="url_video" className="text-foreground text-sm">URL Vídeo / Animación</Label>
                                    <Input
                                        id="url_video" name="url_video"
                                        placeholder="URL de YouTube, Drive..."
                                        value={formData.url_video}
                                        onChange={handleChange}
                                        className="bg-background border-border focus-visible:ring-emerald-500 text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="sticky top-20">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-lg shadow-emerald-900/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                        Completando...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(basePath)}
                                className="w-full mt-3 border-border bg-transparent text-muted-foreground hover:bg-card hover:text-foreground"
                                disabled={isLoading}
                            >
                                Cancelar y descartar
                            </Button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
