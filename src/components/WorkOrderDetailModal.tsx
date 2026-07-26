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
import { getBom } from '@/api/bom'
import { getRouting } from '@/api/routing'
import type {
    WorkOrderReadOnlyDTO,
    WorkOrderOperationReadOnlyDTO,
    UserReadOnlyDTO,
    BomLineReadOnlyDTO,
    RoutingStepReadOnlyDTO,
} from '@/types'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'

interface WorkOrderDetailModalProps {
    workOrder: WorkOrderReadOnlyDTO
    onClose: () => void
    onSuccess: () => void
}

export default function WorkOrderDetailModal({
                                                 workOrder,
                                                 onClose,
                                                 onSuccess,
                                             }: WorkOrderDetailModalProps) {
    const { accessToken } = useAuth()

    const [activeTab, setActiveTab] = useState<'operations' | 'bom' | 'routing'>('operations')
    const [operations, setOperations] = useState<WorkOrderOperationReadOnlyDTO[]>([])
    const [loadingOps, setLoadingOps] = useState(true)
    const [operators, setOperators] = useState<UserReadOnlyDTO[]>([])
    const [actionLoading, setActionLoading] = useState(false)
    const [bomLines, setBomLines] = useState<BomLineReadOnlyDTO[]>([])
    const [routingSteps, setRoutingSteps] = useState<RoutingStepReadOnlyDTO[]>([])

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

    useEffect(() => {
        if (!accessToken || !workOrder.producedItemId) return

        getBom(accessToken, workOrder.producedItemId)
            .then(setBomLines)
            .catch(err => console.error(err))

        getRouting(accessToken, workOrder.producedItemId)
            .then(setRoutingSteps)
            .catch(err => console.error(err))
    }, [accessToken, workOrder.producedItemId])

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

                if (current.status === 'Cancelled' || current.status === 'Completed') continue

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

                {/* Tabs */}
                <div className="flex border-b px-6">
                    {(['operations', 'bom', 'routing'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                activeTab === tab
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab === 'bom' ? 'BOM' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="px-6 py-5">

                    {/* Operations */}
                    {activeTab === 'operations' && (
                        <>
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
                        </>
                    )}

                    {/* BOM */}
                    {activeTab === 'bom' && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Bill of Materials</h3>
                            {bomLines.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No BOM lines found.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-2 pr-4 font-medium">Component</th>
                                        <th className="text-left py-2 pr-4 font-medium">Code</th>
                                        <th className="text-left py-2 pr-4 font-medium">Qty</th>
                                        <th className="text-left py-2 font-medium">Notes</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {bomLines.map(line => (
                                        <tr key={line.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-2 pr-4 font-medium">{line.componentItemName}</td>
                                            <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{line.componentItemCode}</td>
                                            <td className="py-2 pr-4">{line.quantity} {line.unitOfMeasureSymbol}</td>
                                            <td className="py-2 text-muted-foreground">{line.notes ?? '—'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Routing */}
                    {activeTab === 'routing' && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Routing Steps</h3>
                            {routingSteps.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No routing steps found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {routingSteps
                                        .sort((a, b) => a.sequence - b.sequence)
                                        .map(step => (
                                            <div key={step.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                                                <span className="text-muted-foreground font-mono text-xs w-6">#{step.sequence}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{step.operationName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {step.workstationName}
                                                        {step.machineName && ` — ${step.machineName}`}
                                                        {step.estimatedMinutes && ` · ${step.estimatedMinutes} min`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
