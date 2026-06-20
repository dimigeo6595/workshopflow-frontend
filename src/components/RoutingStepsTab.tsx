import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthProvider'
import { getRouting, addRoutingStep, deleteRoutingStep } from '@/api/routing'
import { getWorkstations, getMachines } from '@/api/workstations'
import { routingStepSchema, type RoutingStepFormFields } from '@/schemas/routing'
import type { RoutingStepReadOnlyDTO, WorkstationReadOnlyDTO, MachineReadOnlyDTO } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


interface RoutingStepsTabProps {
    producedItemId: number
}

export default function RoutingStepsTab({ producedItemId }: RoutingStepsTabProps) {
    const {accessToken} = useAuth()

    const [steps, setSteps] = useState<RoutingStepReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [workstations, setWorkstations] = useState<WorkstationReadOnlyDTO[]>([])
    const [machines, setMachines] = useState<MachineReadOnlyDTO[]>([])
    const [selectedWorkstationId, setSelectedWorkstationId] = useState<number | null>(null)

    useEffect(() => {
        if (!accessToken) return

        getRouting(accessToken, producedItemId)
            .then(setSteps)
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [accessToken, producedItemId])

    useEffect(() => {
        if (!accessToken) return
        getWorkstations(accessToken).then(setWorkstations).catch(err => console.error(err))
    }, [accessToken])

    useEffect(() => {
        if (!accessToken || !selectedWorkstationId) {
            return
        }

        let cancelled = false

        getMachines(accessToken, selectedWorkstationId)
            .then(res => {
                if (!cancelled) setMachines(res)
            })
            .catch(err => console.error(err))

        return () => {
            cancelled = true
        }
    }, [accessToken, selectedWorkstationId])

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<RoutingStepFormFields>({
        resolver: zodResolver(routingStepSchema),
    })

    async function handleDelete(stepId: number, operationName: string) {
        if (!accessToken) return
        if (!window.confirm(`Remove step "${operationName}"?`)) return

        try {
            await deleteRoutingStep(accessToken, producedItemId, stepId)
            toast.success('Step removed')
            setSteps(prev => prev.filter(s => s.id !== stepId))
        } catch (err) {
            toast.error('Failed to remove step')
            console.error(err)
        }
    }

    async function onSubmitAdd(data: RoutingStepFormFields) {
        if (!accessToken) return

        try {
            const newStep = await addRoutingStep(accessToken, producedItemId, {
                sequence: data.sequence,
                operationName: data.operationName,
                estimatedMinutes: data.estimatedMinutes,
                workstationId: data.workstationId,
                machineId: data.machineId,
                notes: data.notes || undefined,
            })
            setSteps(prev => [...prev, newStep].sort((a, b) => a.sequence - b.sequence))
            toast.success('Step added')
            setShowAddForm(false)
            setSelectedWorkstationId(null)
            reset()
        } catch (err) {
            const message = err instanceof Error ? err.message : ''
            if (message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('sequence')) {
                toast.error('A step with this sequence already exists')
            } else {
                toast.error(message || 'Failed to add step')
            }
        }
    }

    if (loading) {
        return <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
    }

    return (
        <div className="space-y-3">
            {steps.length === 0 && !showAddForm && (
                <p className="text-sm text-muted-foreground text-center py-6">
                    No routing steps added yet.
                </p>
            )}

            {steps.map(step => (
                <div
                    key={step.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                    <div>
                        <p className="text-sm font-medium">
              <span className="text-muted-foreground font-mono text-xs mr-2">
                #{step.sequence}
              </span>
                            {step.operationName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {step.workstationName}
                            {step.machineName && ` — ${step.machineName}`}
                            {' · '}
                            {step.estimatedMinutes} min
                            {step.notes && ` — ${step.notes}`}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDelete(step.id, step.operationName)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove step"
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
                    Add step
                </button>
            ) : (
                <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-3 rounded-lg border p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Sequence</label>
                            <Input type="number" {...register('sequence', { valueAsNumber: true })} />
                            {errors.sequence && (
                                <p className="text-sm text-destructive mt-1">{errors.sequence.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Estimated minutes</label>
                            <Input type="number" {...register('estimatedMinutes', { valueAsNumber: true })} />
                            {errors.estimatedMinutes && (
                                <p className="text-sm text-destructive mt-1">{errors.estimatedMinutes.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Operation name</label>
                        <Input {...register('operationName')} placeholder="e.g. Cutting, Welding..." />
                        {errors.operationName && (
                            <p className="text-sm text-destructive mt-1">{errors.operationName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Workstation</label>
                            <select
                                {...register('workstationId', {
                                    valueAsNumber: true,
                                    onChange: e => {
                                        setSelectedWorkstationId(Number(e.target.value) || null)
                                        setMachines([])
                                    },
                                })}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Select...</option>
                                {workstations.map(ws => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name} ({ws.code})
                                    </option>
                                ))}
                            </select>
                            {errors.workstationId && (
                                <p className="text-sm text-destructive mt-1">{errors.workstationId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Machine (optional)</label>
                            <select
                                {...register('machineId', { valueAsNumber: true })}
                                disabled={!selectedWorkstationId}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                                <option value="">None</option>
                                {machines.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.code})
                                    </option>
                                ))}
                            </select>
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
                                setSelectedWorkstationId(null)
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











