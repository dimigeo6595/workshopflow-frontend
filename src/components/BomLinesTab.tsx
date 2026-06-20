import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getBom, deleteBomLine } from '@/api/bom'
import type { BomLineReadOnlyDTO } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addBomLine } from '@/api/bom'
import { getUoMs } from '@/api/uom'
import { bomLineSchema, type BomLineFormFields } from '@/schemas/bom'
import type { ItemReadOnlyDTO, UoMReadOnlyDTO } from '@/types'
import ItemAutocomplete from '@/components/ItemAutocomplete'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BomLinesTabProps {
    producedItemId: number
}

export default function BomLinesTab({ producedItemId }: BomLinesTabProps) {
    const { accessToken } = useAuth()

    const [bomLines, setBomLines] = useState<BomLineReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [uoms, setUoms] = useState<UoMReadOnlyDTO[]>([])
    const [selectedComponent, setSelectedComponent] = useState<ItemReadOnlyDTO | null>(null)


    useEffect(() => {
        if (!accessToken) return

        getBom(accessToken, producedItemId)
            .then(setBomLines)
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [accessToken, producedItemId])

    useEffect(() => {
        if (!accessToken) return
        getUoMs(accessToken).then(setUoms).catch(err => console.error(err))
    }, [accessToken])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<BomLineFormFields>({
        resolver: zodResolver(bomLineSchema),
    })




    async function onSubmitAdd(data: BomLineFormFields) {
        if (!accessToken) return

        try {
            const newLine = await addBomLine(accessToken, producedItemId, {
                componentItemId: data.componentItemId,
                quantity: data.quantity,
                unitOfMeasureId: data.unitOfMeasureId,
                notes: data.notes || undefined,
            })
            setBomLines(prev => [...prev, newLine])
            toast.success('Component added')
            setShowAddForm(false)
            setSelectedComponent(null)
            reset()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to add component')
        }
    }






    async function handleDelete(bomLineId: number, componentName: string) {
        if (!accessToken) return
        if (!window.confirm(`Remove "${componentName}" from the BOM?`)) return

        try {
            await deleteBomLine(accessToken, producedItemId, bomLineId)
            toast.success('Component removed')
            setBomLines(prev => prev.filter(line => line.id !== bomLineId))
        } catch (err) {
            toast.error('Failed to remove component')
            console.error(err)
        }
    }

    if (loading) {
        return <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
    }

    return (
        <div className="space-y-3">
            {bomLines.length === 0 && !showAddForm && (
                <p className="text-sm text-muted-foreground text-center py-6">
                    No components added yet.
                </p>
            )}

            {bomLines.map(line => (
                <div
                    key={line.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                    <div>
                        <p className="text-sm font-medium">
                            {line.componentItemName}{' '}
                            <span className="text-muted-foreground font-mono text-xs">
                ({line.componentItemCode})
              </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Qty: {line.quantity} {line.unitOfMeasureSymbol}
                            {line.notes && ` — ${line.notes}`}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDelete(line.id, line.componentItemName)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove component"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}

            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                    <Plus className="w-4 h-4" />
                    Add component
                </button>
            ) : (
                <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-3 rounded-lg border p-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Component item</label>
                        <ItemAutocomplete
                            value={selectedComponent}
                            onChange={item => {
                                setSelectedComponent(item)
                                if (item) {
                                    setValue('componentItemId', item.id)
                                    setValue('unitOfMeasureId', item.unitOfMeasureId)
                                }
                            }}
                            excludeItemId={producedItemId}
                        />
                        {errors.componentItemId && (
                            <p className="text-sm text-destructive mt-1">{errors.componentItemId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Quantity</label>
                            <Input type="number" step="0.0001" {...register('quantity', { valueAsNumber: true })} />
                            {errors.quantity && (
                                <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Unit of measure</label>
                            <select
                                {...register('unitOfMeasureId', { valueAsNumber: true })}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Select...</option>
                                {uoms.map(uom => (
                                    <option key={uom.id} value={uom.id}>
                                        {uom.name} ({uom.symbol})
                                    </option>
                                ))}
                            </select>
                            {errors.unitOfMeasureId && (
                                <p className="text-sm text-destructive mt-1">{errors.unitOfMeasureId.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Notes (optional)</label>
                        <Input {...register('notes')} />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowAddForm(false)
                                setSelectedComponent(null)
                                reset()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}

