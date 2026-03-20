import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategorias, useCreateCategoria, useDeleteCategoria } from '@/hooks/useCategorias';
import { toast } from 'sonner';

interface CategorySelectProps {
    campo: string;
    value: string;
    onChange: (value: string) => void;
    staticOptions: string[];
    placeholder?: string;
    label?: string;
}

export function CategorySelect({ campo, value, onChange, staticOptions, placeholder, label }: CategorySelectProps) {
    const { data: customCategories, isLoading } = useCategorias(campo);
    const createMutation = useCreateCategoria();
    const deleteMutation = useDeleteCategoria();

    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState('');

    const handleAdd = async () => {
        if (!newValue.trim()) return;
        try {
            const res = await createMutation.mutateAsync({ campo, valor: newValue.trim() });
            onChange(res.valor);
            setNewValue('');
            setIsAdding(false);
            toast.success('Categoría añadida');
        } catch (error) {
            console.error(error);
            toast.error('Error al añadir categoría');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await deleteMutation.mutateAsync(id);
            if (customCategories?.find(c => c.id === id)?.valor === value) {
                onChange('');
            }
            toast.success('Categoría eliminada');
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar');
        }
    };

    const allOptions = [
        ...staticOptions.map(opt => ({ id: `static-${opt}`, valor: opt, isStatic: true })),
        ...(customCategories || []).map(cat => ({ id: cat.id, valor: cat.valor, isStatic: false }))
    ];

    return (
        <div className="space-y-2">
            {label && <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{label}</Label>}
            
            <div className="flex items-center gap-2">
                {!isAdding ? (
                    <>
                        <div className="flex-1 min-w-0">
                            <Select value={value} onValueChange={onChange}>
                                <SelectTrigger className="bg-card border-border h-10 w-full text-foreground">
                                    <SelectValue placeholder={placeholder || "Selecciona..."} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center p-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        allOptions.map((opt) => (
                                            <div key={opt.id} className="relative flex items-center pr-8 group">
                                                <SelectItem value={opt.valor} className="w-full">
                                                    {opt.valor}
                                                </SelectItem>
                                                {!opt.isStatic && (
                                                    <button
                                                        onClick={(e) => handleDelete(e, opt.id)}
                                                        className="absolute right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 border-border bg-muted hover:bg-emerald-500/10 hover:text-emerald-500"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </>
                ) : (
                    <div className="flex-1 flex items-center gap-1 animate-in slide-in-from-right duration-200 min-w-0">
                        <Input
                            className="h-10 flex-1 bg-background border-emerald-500/50 focus:ring-emerald-500 min-w-0"
                            placeholder="Nueva..."
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            autoFocus
                        />
                        <Button
                            type="button"
                            size="icon"
                            className="h-10 w-10 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleAdd}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => { setIsAdding(false); setNewValue(''); }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
