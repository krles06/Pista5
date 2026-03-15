import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Image as ImageIcon, Save, X } from 'lucide-react';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (ejercicio.url_imagen) {
                setImagePreview(ejercicio.url_imagen);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                    className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                        {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                        {esPorteros && <span className="ml-3 text-sm font-normal text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Porteros</span>}
                    </h1>
                    <p className="text-zinc-400">
                        Completa los detalles de esta tarea técnica o táctica.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-zinc-50">Información Principal</CardTitle>
                                <CardDescription className="text-zinc-400">Nombres, objetivos y explicación descriptiva.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="titulo" className="text-zinc-300">Título del ejercicio *</Label>
                                    <Input
                                        id="titulo" name="titulo"
                                        placeholder="Ej: Rondo 4v1, Posesión 6v6 con comodines..."
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="etapa_sesion" className="text-zinc-300">Etapa de la sesión *</Label>
                                        <Select value={formData.etapa_sesion} onValueChange={(v) => handleSelectChange('etapa_sesion', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona la etapa" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
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
                                            className="border-zinc-700 data-[state=checked]:bg-emerald-600"
                                        />
                                        <Label htmlFor="es_portero" className="text-zinc-300 font-normal leading-none cursor-pointer">
                                            Específico para porteros
                                        </Label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="objetivo_principal" className="text-zinc-300">Objetivo Principal</Label>
                                        <Input
                                            id="objetivo_principal" name="objetivo_principal"
                                            placeholder="Ej: Mejora del pase de seguridad"
                                            value={formData.objetivo_principal}
                                            onChange={handleChange}
                                            className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tipo_tarea" className="text-zinc-300">Tipo de Tarea</Label>
                                        <Select value={formData.tipo_tarea} onValueChange={(v) => handleSelectChange('tipo_tarea', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona tipo" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {TIPO_TAREA.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descripcion" className="text-zinc-300">Descripción detallada</Label>
                                    <Textarea
                                        id="descripcion" name="descripcion"
                                        placeholder="Explica el funcionamiento del ejercicio..."
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        className="min-h-[120px] bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 placeholder:text-zinc-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reglas" className="text-zinc-300">Reglas y consignas</Label>
                                    <Textarea
                                        id="reglas" name="reglas"
                                        placeholder="Restricciones de toques, puntuaciones especiales..."
                                        value={formData.reglas}
                                        onChange={handleChange}
                                        className="min-h-[80px] bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 placeholder:text-zinc-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="border-zinc-800 bg-zinc-900 shadow-xl lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-xl text-zinc-50">Categorización</CardTitle>
                                    <CardDescription className="text-zinc-400">Define los aspectos técnicos y tácticos de la tarea.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Tipo de Trabajo</Label>
                                        <Select value={formData.tipo_trabajo} onValueChange={(v) => handleSelectChange('tipo_trabajo', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona trabajo" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {TIPO_TRABAJO.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Trabajo Específico</Label>
                                        <Select value={formData.trabajo} onValueChange={(v) => handleSelectChange('trabajo', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona fase" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {TRABAJO.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Componente del Juego</Label>
                                        <Select value={formData.componente_juego} onValueChange={(v) => handleSelectChange('componente_juego', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona componente" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {COMPONENTE_JUEGO.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Sistema de Juego</Label>
                                        <Select value={formData.sistema_juego} onValueChange={(v) => handleSelectChange('sistema_juego', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona sistema" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {SISTEMA_JUEGO.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Dificultad</Label>
                                        <Select value={formData.dificultad} onValueChange={(v) => handleSelectChange('dificultad', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona dificultad" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {DIFICULTAD.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Trabajo Físico Integrado</Label>
                                        <Select value={formData.trabajo_fisico_integrado} onValueChange={(v) => handleSelectChange('trabajo_fisico_integrado', v)}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                <SelectValue placeholder="Selecciona físico" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                {TRABAJO_FISICO_INTEGRADO.map((item) => (
                                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6 lg:col-span-1">
                                <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-zinc-50">Parámetros</CardTitle>
                                        <CardDescription className="text-zinc-400">Organización y tiempos.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="duracion_minutos" className="text-zinc-300">Duración (min)</Label>
                                            <Input
                                                type="number" id="duracion_minutos" name="duracion_minutos"
                                                placeholder="Ej: 15"
                                                value={formData.duracion_minutos}
                                                onChange={handleChange}
                                                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                                                min="1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="n_jugadores" className="text-zinc-300">Nº Jugadores</Label>
                                            <Select value={formData.n_jugadores} onValueChange={(v) => handleSelectChange('n_jugadores', v)}>
                                                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50">
                                                    <SelectValue placeholder="Nº Jug." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                    {NUMERO_JUGADORES.map((num) => (
                                                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dimensiones" className="text-zinc-300">Dimensiones</Label>
                                            <Input
                                                id="dimensiones" name="dimensiones"
                                                placeholder="Ej: 20x20m"
                                                value={formData.dimensiones}
                                                onChange={handleChange}
                                                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
                            <CardHeader className="bg-zinc-950/50 border-b border-zinc-800">
                                <CardTitle className="text-lg text-zinc-50 flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-emerald-500" />
                                    Imagen Referencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-zinc-800 bg-zinc-950 aspect-[4/3] flex items-center justify-center transition-colors hover:border-emerald-500/50">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                                <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="bg-zinc-200 text-zinc-900 hover:bg-white text-xs">
                                                    Cambiar
                                                </Button>
                                                <Button type="button" size="icon" variant="destructive" onClick={clearImage} className="h-8 w-8">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                                <Upload className="h-5 w-5 text-zinc-500 group-hover:text-emerald-500" />
                                            </div>
                                            <p className="text-sm font-medium text-zinc-300">Subir imagen</p>
                                            <p className="text-xs text-zinc-500 mt-1 px-4">Arrastra o haz clic. JPG, PNG (Max 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="space-y-2 pt-2 border-t border-zinc-800">
                                    <Label htmlFor="url_video" className="text-zinc-300 text-sm">URL Vídeo / Animación</Label>
                                    <Input
                                        id="url_video" name="url_video"
                                        placeholder="URL de YouTube, Drive..."
                                        value={formData.url_video}
                                        onChange={handleChange}
                                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 text-xs"
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
                                className="w-full mt-3 border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
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
