import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'
import { workOrderSchema, type WorkOrderFormFields } from '@/schemas/workorders'
import { createWorkOrder } from '@/api/workorders'
import type { ItemReadOnlyDTO } from '@/types'
import ItemAutocomplete from '@/components/ItemAutocomplete'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

interface WorkOrderFormModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function WorkOrderFormModal({ onClose, onSuccess }: WorkOrderFormModalProps) {
    const { accessToken } = useAuth()

    const [selectedItem, setSelectedItem] = useState<ItemReadOnlyDTO | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<WorkOrderFormFields>({
        resolver: zodResolver(workOrderSchema),
    })

    const onSubmit = async (data: WorkOrderFormFields) => {
        if (!accessToken) return

        try {
            await createWorkOrder(accessToken, {
                producedItemId: data.producedItemId,
                quantity: data.quantity,
                plannedStartDate: data.plannedStartDate,
                plannedEndDate: data.plannedEndDate,
                notes: data.notes || undefined,
            })
            toast.success('Work order created')
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create work order')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border bg-card shadow-lg max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">New Work Order</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Item to produce</label>
                        <ItemAutocomplete
                            value={selectedItem}
                            onChange={item => {
                                setSelectedItem(item)
                                if (item) setValue('producedItemId', item.id)
                            }}
                            itemTypeFilter={['SemiFinished', 'FinalProduct']}
                            placeholder="Search manufactured item..."
                        />
                        {errors.producedItemId && (
                            <p className="text-sm text-destructive mt-1">{errors.producedItemId.message}</p>
                        )}
                    </div>

                    <Field>
                        <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                        <Input
                            id="quantity"
                            type="number"
                            {...register('quantity', { valueAsNumber: true })}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-destructive">{errors.quantity.message}</p>
                        )}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <FieldLabel htmlFor="plannedStartDate">Planned start</FieldLabel>
                            <Input
                                id="plannedStartDate"
                                type="date"
                                {...register('plannedStartDate')}
                            />
                            {errors.plannedStartDate && (
                                <p className="text-sm text-destructive">{errors.plannedStartDate.message}</p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="plannedEndDate">Planned end</FieldLabel>
                            <Input
                                id="plannedEndDate"
                                type="date"
                                {...register('plannedEndDate')}
                            />
                            {errors.plannedEndDate && (
                                <p className="text-sm text-destructive">{errors.plannedEndDate.message}</p>
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                        <Input id="notes" {...register('notes')} />
                    </Field>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create work order'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}