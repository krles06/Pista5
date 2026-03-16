import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
    value?: string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    label?: string;
    description?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    label = "Imagen de Referencia",
    description = "JPG, PNG o GIF (Máx. 5MB)",
    className = ""
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value) {
            setPreview(value);
        } else {
            setPreview(null);
        }
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null);
        if (onRemove) onRemove();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">{label}</label>
            </div>

            <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer border-2 border-dashed border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden aspect-[4/3] flex flex-col items-center justify-center transition-all hover:border-emerald-500/50 hover:bg-zinc-900/50"
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Cambiar imagen
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={handleRemove}
                                className="h-9 w-9"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                            <Upload className="h-6 w-6 text-zinc-500 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300 font-outfit">Subir imagen</p>
                        <p className="text-xs text-zinc-500 mt-1">{description}</p>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
}
