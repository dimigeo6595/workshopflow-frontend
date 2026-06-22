import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getWorkOrders } from '@/api/workorders'
import type { WorkOrderReadOnlyDTO } from '@/types'
import { ClipboardList, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import WorkOrderFormModal from '@/components/WorkOrderFormModal'
import WorkOrderDetailModal from '@/components/WorkOrderDetailModal'

export default function WorkOrdersPage() {
    const { accessToken, hasCapability } = useAuth()

    const [workOrders, setWorkOrders] = useState<WorkOrderReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderReadOnlyDTO | null>(null)

    useEffect(() => {
        if (!accessToken) return

        const fetchWorkOrders = async () => {
            try {
                const res = await getWorkOrders(accessToken, {
                    pageNumber,
                    pageSize: 20,
                    status: filterStatus || undefined,
                })
                setWorkOrders(res.data)
                setTotalPages(res.totalPages)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkOrders()
    }, [accessToken, filterStatus, pageNumber])

    function handleModalSuccess() {
        if (!accessToken) return
        getWorkOrders(accessToken, {
            pageNumber,
            pageSize: 20,
            status: filterStatus || undefined,
        })
            .then(res => {
                setWorkOrders(res.data)
                setTotalPages(res.totalPages)
            })
            .catch(err => console.error(err))
    }

    function handleOpenDetail(wo: WorkOrderReadOnlyDTO) {
        setSelectedWorkOrder(wo)
    }

    function handleCloseDetail() {
        setSelectedWorkOrder(null)
    }

    function handleDetailSuccess() {
        handleModalSuccess()   // ίδιο refresh logic, ξανά-χρησιμοποιούμε
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                {hasCapability('INSERT_WORK_ORDER') && (
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        New Work Order
                    </Button>
                )}

                <select
                    value={filterStatus}
                    onChange={e => {
                        setFilterStatus(e.target.value)
                        setPageNumber(1)
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Released">Released</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                        <th className="text-left py-3 px-4 font-medium">Code</th>
                        <th className="text-left py-3 px-4 font-medium">Item</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Qty</th>
                        <th className="text-left py-3 px-4 font-medium">Operations</th>
                        <th className="text-left py-3 px-4 font-medium">Planned Start</th>
                        <th className="text-left py-3 px-4 font-medium">Planned End</th>
                    </tr>
                    </thead>
                    <tbody>
                    {workOrders.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No work orders found
                            </td>
                        </tr>
                    ) : (
                        workOrders.map(wo => (
                            <tr
                                key={wo.id}
                                onClick={() => handleOpenDetail(wo)}
                                className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <td className="py-3 px-4 font-mono text-xs">{wo.workOrderCode}</td>
                                <td className="py-3 px-4 font-medium">{wo.producedItemName}</td>
                                <td className="py-3 px-4">
                                    <StatusBadge status={wo.status} />
                                </td>
                                <td className="py-3 px-4">
                                    {wo.quantity} {wo.unitOfMeasureSymbol}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">
                                    {wo.completedOperations} / {wo.totalOperations}
                                </td>
                                <td className="py-3 px-4">
                                    {wo.plannedStartDate
                                        ? new Date(wo.plannedStartDate).toLocaleDateString('el-GR')
                                        : '—'}
                                </td>
                                <td className="py-3 px-4">
                                    {wo.plannedEndDate
                                        ? new Date(wo.plannedEndDate).toLocaleDateString('el-GR')
                                        : '—'}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pageNumber} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            disabled={pageNumber === 1}
                            className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <button
                            onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                            disabled={pageNumber === totalPages}
                            className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && hasCapability('INSERT_WORK_ORDER') && (
                <WorkOrderFormModal
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {selectedWorkOrder && hasCapability('INSERT_WORK_ORDER') && (
                <WorkOrderDetailModal
                    workOrder={selectedWorkOrder}
                    onClose={handleCloseDetail}
                    onSuccess={handleDetailSuccess}
                />
            )}
        </div>
    )
}