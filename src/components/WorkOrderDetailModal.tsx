import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import {
    getOperations,
    releaseWorkOrder,
    cancelWorkOrder,
    assignOperation,
    startOperation,
    completeOperation,
} from '@/api/workorders'
import { getUsers } from '@/api/users'
import type { WorkOrderReadOnlyDTO, WorkOrderOperationReadOnlyDTO, UserReadOnlyDTO } from '@/types'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'

interface WorkOrderDetailModalProps {
    workOrder: WorkOrderReadOnlyDTO
    onClose: () => void
    onSuccess: () => void   // refresh the table after release/cancel
}

export default function WorkOrderDetailModal({
                                                 workOrder,
                                                 onClose,
                                                 onSuccess,
                                             }: WorkOrderDetailModalProps) {
    const { accessToken } = useAuth()

    const [operations, setOperations] = useState<WorkOrderOperationReadOnlyDTO[]>([])
    const [loadingOps, setLoadingOps] = useState(true)
    const [operators, setOperators] = useState<UserReadOnlyDTO[]>([])
    const [actionLoading, setActionLoading] = useState(false)


    useEffect(() => {
        if (!accessToken) return

        getOperations(accessToken, workOrder.id)
            .then(setOperations)
            .catch(err => console.error(err))
            .finally(() => setLoadingOps(false))
    }, [accessToken, workOrder.id])

    useEffect(() => {
        if (!accessToken) return

        getUsers(accessToken, { userRole: 'OPERATOR', pageSize: 100 })
            .then(res => setOperators(res.data))
            .catch(err => console.error(err))
    }, [accessToken])


    async function handleRelease() {
        if (!accessToken) return
        setActionLoading(true)
        try {
            await releaseWorkOrder(accessToken, workOrder.id)
            toast.success('Work order released')
            onSuccess()
            onClose()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to release work order')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleCancel() {
        if (!accessToken) return
        if (!window.confirm('Cancel this work order? Consumed stock will be returned if applicable.')) return

        setActionLoading(true)
        try {
            await cancelWorkOrder(accessToken, workOrder.id)
            toast.success('Work order cancelled')
            onSuccess()
            onClose()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to cancel work order')
        } finally {
            setActionLoading(false)
        }
    }


    async function handleAssign(operationId: number, userId: number) {
        if (!accessToken) return
        setActionLoading(true)
        try {
            const updated = await assignOperation(accessToken, workOrder.id, operationId, userId)
            setOperations(prev => prev.map(op => (op.id === operationId ? updated : op)))
            toast.success('Operator assigned')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to assign operator')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleStart(operationId: number) {
        if (!accessToken) return
        setActionLoading(true)
        try {
            const updated = await startOperation(accessToken, workOrder.id, operationId)
            setOperations(prev => prev.map(op => (op.id === operationId ? updated : op)))
            toast.success('Operation started')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to start operation')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleComplete(operationId: number) {
        if (!accessToken) return
        setActionLoading(true)
        try {
            const updated = await completeOperation(accessToken, workOrder.id, operationId)
            setOperations(prev => prev.map(op => (op.id === operationId ? updated : op)))
            toast.success('Operation completed')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to complete operation')
        } finally {
            setActionLoading(false)
        }
    }


    function canStart(operation: WorkOrderOperationReadOnlyDTO): boolean {
        if (operation.status !== 'Pending') return false
        if (!operation.assignedToUsername) return false
        if (operation.sequence === 1) return true

        const previousOp = operations.find(op => op.sequence === operation.sequence - 1)
        return previousOp?.status === 'Completed'
    }

    async function handleQuickCompleteAll() {
        if (!accessToken || operators.length === 0) return
        setActionLoading(true)

        try {
            const sorted = [...operations].sort((a, b) => a.sequence - b.sequence)

            for (const op of sorted) {
                let current = op

                if (current.status === 'Cancelled' || current.status === 'Completed') {
                    continue
                }

                if (!current.assignedToUsername) {
                    current = await assignOperation(accessToken, workOrder.id, current.id, operators[0].id)
                }

                if (current.status === 'Pending') {
                    current = await startOperation(accessToken, workOrder.id, current.id)
                }

                if (current.status === 'InProgress') {
                    current = await completeOperation(accessToken, workOrder.id, current.id)
                }

                setOperations(prev => prev.map(o => (o.id === current.id ? current : o)))
            }

            toast.success('All operations completed')
            onSuccess()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed during quick complete')
        } finally {
            setActionLoading(false)
        }
    }

    const canRelease = workOrder.status === 'Draft'
    const canCancel = ['Draft', 'Released', 'InProgress'].includes(workOrder.status)
    const hasOperations = operations.length > 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border bg-card shadow-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold font-mono">{workOrder.workOrderCode}</h2>
                        <p className="text-sm text-muted-foreground">
                            {workOrder.producedItemName} — {workOrder.quantity} {workOrder.unitOfMeasureSymbol}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status + actions */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <StatusBadge status={workOrder.status} />
                    <div className="flex gap-2">
                        {canRelease && (
                            <Button size="sm" onClick={handleRelease} disabled={actionLoading}>
                                Release
                            </Button>
                        )}
                        {hasOperations && workOrder.status !== 'Completed' && workOrder.status !== 'Cancelled' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleQuickCompleteAll}
                                disabled={actionLoading}
                                title="Dev tool: auto-assign, start and complete all operations"
                            >
                                ⚡ Quick complete (dev)
                            </Button>
                        )}
                        {canCancel && (
                            <Button size="sm" variant="destructive" onClick={handleCancel} disabled={actionLoading}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Operations timeline */}
                <div className="px-6 py-5">
                    <h3 className="text-sm font-semibold mb-3">Operations</h3>

                    {loadingOps ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                    ) : !hasOperations ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            {workOrder.status === 'Draft'
                                ? 'Operations will appear after this work order is released.'
                                : 'No operations found.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {operations
                                .sort((a, b) => a.sequence - b.sequence)
                                .map(op => (
                                    <div key={op.id} className="rounded-lg border px-4 py-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">
                        <span className="text-muted-foreground font-mono text-xs mr-2">
                          #{op.sequence}
                        </span>
                                                {op.operationName}
                                            </p>
                                            <StatusBadge status={op.status} />
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {op.workstationName}
                                            {op.machineName && ` — ${op.machineName}`}
                                        </p>

                                        {op.status === 'Pending' && (
                                            <div className="flex items-center gap-2 pt-1">
                                                {op.assignedToUsername ? (
                                                    <p className="text-sm text-muted-foreground flex-1">
                                                        Assigned to: <span className="text-foreground font-medium">{op.assignedToUsername}</span>
                                                    </p>
                                                ) : (
                                                    <select
                                                        defaultValue=""
                                                        onChange={e => {
                                                            const userId = Number(e.target.value)
                                                            if (userId) handleAssign(op.id, userId)
                                                        }}
                                                        disabled={actionLoading}
                                                        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                                    >
                                                        <option value="">Assign operator...</option>
                                                        {operators.map(u => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.firstname} {u.lastname}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={!canStart(op) || actionLoading}
                                                    onClick={() => handleStart(op.id)}
                                                >
                                                    Start
                                                </Button>
                                            </div>
                                        )}

                                        {op.status === 'InProgress' && (
                                            <div className="flex justify-end pt-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleComplete(op.id)}
                                                    disabled={actionLoading}
                                                >
                                                    Complete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


