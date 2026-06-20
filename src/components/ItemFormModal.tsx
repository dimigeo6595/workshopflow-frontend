import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'
import { itemSchema, type ItemFormFields } from '@/schemas/items'
import { createItem, updateItem } from '@/api/items'
import { getUoMs } from '@/api/uom'
import type { ItemReadOnlyDTO, UoMReadOnlyDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import BomLinesTab from "@/components/BomLinesTab.tsx";
import RoutingStepsTab from '@/components/RoutingStepsTab'

interface ItemFormModalProps {
    item: ItemReadOnlyDTO | null   // null = create mode, αλλιώς edit mode
    onClose: () => void
    onSuccess: () => void           // καλείται μετά από επιτυχή save, για refresh του table
}

export default function ItemFormModal({ item, onClose, onSuccess }: ItemFormModalProps) {
    const { accessToken } = useAuth()
    const isEditMode = item !== null

    const [uoms, setUoms] = useState<UoMReadOnlyDTO[]>([])

    const isManufactured = item ? item.itemType === 'SemiFinished' || item.itemType === 'FinalProduct' : false
    const showProductionTabs = isEditMode && isManufactured

    const [activeTab, setActiveTab] = useState<'details' | 'bom' | 'routing'>('details')



    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ItemFormFields>({
        resolver: zodResolver(itemSchema),
        defaultValues: item
            ? {
                itemCode: item.itemCode,
                name: item.name,
                description: item.description ?? '',
                itemType: item.itemType,
                weightPerUoM: item.weightPerUoM,
            }
            : {
                itemCode: '',
                name: '',
                description: '',
                itemType: 'RawMaterial',
            },
    })

    useEffect(() => {
        if (!accessToken) return

        getUoMs(accessToken)
            .then(setUoms)
            .catch(err => console.error('Failed to load UoMs', err))
    }, [accessToken])



    const onSubmit = async (data: ItemFormFields) => {
        if (!accessToken) return

        try {
            if (isEditMode && item) {
                await updateItem(accessToken, item.id, {
                    name: data.name,
                    description: data.description || undefined,
                    itemType: data.itemType,
                    weightPerUoM: data.weightPerUoM,
                    unitOfMeasureId: data.unitOfMeasureId,
                    weightUoMId: data.weightUoMId,
                })
                toast.success('Item updated')
            } else {
                await createItem(accessToken, {
                    itemCode: data.itemCode,
                    name: data.name,
                    description: data.description || undefined,
                    itemType: data.itemType,
                    weightPerUoM: data.weightPerUoM,
                    unitOfMeasureId: data.unitOfMeasureId,
                    weightUoMId: data.weightUoMId,
                })
                toast.success('Item created')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        }
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border bg-card shadow-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">
                        {isEditMode ? 'Edit Item' : 'New Item'}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {showProductionTabs && (
                    <div className="flex border-b px-6">
                        {(['details', 'bom', 'routing'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab === 'bom' ? 'BOM' : tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Form */}
                {activeTab === 'details' && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">

                    <Field>
                        <FieldLabel htmlFor="itemCode">Item Code</FieldLabel>
                        <Input
                            id="itemCode"
                            disabled={isEditMode}
                            {...register('itemCode')}
                        />
                        {errors.itemCode && (
                            <p className="text-sm text-destructive">{errors.itemCode.message}</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input id="name" {...register('name')} />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Input id="description" {...register('description')} />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="itemType">Item Type</FieldLabel>
                        <select
                            id="itemType"
                            {...register('itemType')}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="RawMaterial">Raw Material</option>
                            <option value="SemiFinished">Semi-Finished</option>
                            <option value="FinalProduct">Final Product</option>
                            <option value="Consumable">Consumable</option>
                        </select>
                        {errors.itemType && (
                            <p className="text-sm text-destructive">{errors.itemType.message}</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="unitOfMeasureId">Unit of Measure</FieldLabel>
                        <select
                            id="unitOfMeasureId"
                            defaultValue={item?.unitOfMeasureSymbol ? '' : ''}
                            {...register('unitOfMeasureId', { valueAsNumber: true })}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Select unit...</option>
                            {uoms.map(uom => (
                                <option key={uom.id} value={uom.id}>
                                    {uom.name} ({uom.symbol})
                                </option>
                            ))}
                        </select>
                        {errors.unitOfMeasureId && (
                            <p className="text-sm text-destructive">{errors.unitOfMeasureId.message}</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="weightPerUoM">Weight per UoM (kg) — optional</FieldLabel>
                        <Input
                            id="weightPerUoM"
                            type="number"
                            step="0.01"
                            {...register('weightPerUoM', { valueAsNumber: true })}
                        />
                        {errors.weightPerUoM && (
                            <p className="text-sm text-destructive">{errors.weightPerUoM.message}</p>
                        )}
                    </Field>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create item'}
                        </Button>
                    </div>
                    </form>
                )}

                {activeTab === 'bom' && item && (
                    <div className="px-6 py-5">
                        <BomLinesTab producedItemId={item.id} />
                    </div>
                )}

                {activeTab === 'routing' && item && (
                    <div className="px-6 py-5">
                        <RoutingStepsTab producedItemId={item.id} />
                    </div>
                )}



            </div>
        </div>
    )
}






