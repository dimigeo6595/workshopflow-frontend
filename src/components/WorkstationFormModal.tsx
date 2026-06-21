import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'
import { workstationSchema, type WorkstationFormFields } from '@/schemas/workstations'
import { createWorkstation, updateWorkstation } from '@/api/workstations'
import type { WorkstationReadOnlyDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

interface WorkstationFormModalProps {
    workstation: WorkstationReadOnlyDTO | null
    onClose: () => void
    onSuccess: () => void
}

export default function WorkstationFormModal({
                                                 workstation,
                                                 onClose,
                                                 onSuccess,
                                             }: WorkstationFormModalProps) {
    const { accessToken } = useAuth()
    const isEditMode = workstation !== null

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<WorkstationFormFields>({
        resolver: zodResolver(workstationSchema),
        defaultValues: workstation
            ? { code: workstation.code, name: workstation.name, notes: workstation.notes ?? '' }
            : { code: '', name: '', notes: '' },
    })

    const onSubmit = async (data: WorkstationFormFields) => {
        if (!accessToken) return

        try {
            if (isEditMode && workstation) {
                await updateWorkstation(accessToken, workstation.id, {
                    name: data.name,
                    notes: data.notes || undefined,
                })
                toast.success('Workstation updated')
            } else {
                await createWorkstation(accessToken, {
                    code: data.code,
                    name: data.name,
                    notes: data.notes || undefined,
                })
                toast.success('Workstation created')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">
                        {isEditMode ? 'Edit Workstation' : 'New Workstation'}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
                    <Field>
                        <FieldLabel htmlFor="code">Code</FieldLabel>
                        <Input id="code" disabled={isEditMode} {...register('code')} />
                        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                        <Input id="notes" {...register('notes')} />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
                    </Field>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create workstation'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}