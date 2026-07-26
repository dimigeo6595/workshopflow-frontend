import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getWorkOrders } from '@/api/workorders'
import { getItems } from '@/api/items'
import type { WorkOrderReadOnlyDTO, ItemReadOnlyDTO } from '@/types'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ClipboardList, Package, CheckCircle, Clock, Wrench, BarChart2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import WorkOrderDetailModal from '@/components/WorkOrderDetailModal'

export default function DashboardPage() {
    const { accessToken, user, hasCapability } = useAuth()

    const [workOrders, setWorkOrders] = useState<WorkOrderReadOnlyDTO[]>([])
    const [items, setItems] = useState<ItemReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [ganttView, setGanttView] = useState<'week' | 'month'>('week')
    const [selectedWo, setSelectedWo] = useState<WorkOrderReadOnlyDTO | null>(null)

    const isAdminOrEngineer = hasCapability('VIEW_WORK_ORDERS') && hasCapability('VIEW_ITEMS')
    const isOperator = user?.role === 'OPERATOR'

    useEffect(() => {
        if (!accessToken) return

        async function fetchData() {
            try {
                if (isAdminOrEngineer) {
                    const [woRes, itemsRes] = await Promise.all([
                        getWorkOrders(accessToken!, { pageSize: 500 }),
                        getItems(accessToken!, { pageSize: 100 }),
                    ])
                    setWorkOrders(woRes.data)
                    setItems(itemsRes.data)
                } else if (isOperator) {
                    const woRes = await getWorkOrders(accessToken!, { pageSize: 100 })
                    setWorkOrders(woRes.data)
                } else {
                    const itemsRes = await getItems(accessToken!, { pageSize: 100 })
                    setItems(itemsRes.data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        void fetchData()
    }, [accessToken])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    // ── Gantt helpers ──────────────────────────────────────────────────────
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    function getGanttDays(): Date[] {
        const days: Date[] = []
        const count = ganttView === 'week' ? 7 : 30
        for (let i = 0; i < count; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            days.push(d)
        }
        return days
    }

    function getGanttStart(): Date {
        return today
    }

    function getGanttEnd(): Date {
        const end = new Date(today)
        end.setDate(today.getDate() + (ganttView === 'week' ? 6 : 29))
        return end
    }

    function woOverlapsRange(wo: WorkOrderReadOnlyDTO): boolean {
        const start = new Date(wo.plannedStartDate)
        const end = new Date(wo.plannedEndDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(0, 0, 0, 0)
        return start <= getGanttEnd() && end >= getGanttStart()
    }

    function getBarStyle(wo: WorkOrderReadOnlyDTO): React.CSSProperties {
        const ganttStart = getGanttStart()
        const ganttEnd = getGanttEnd()
        const totalDays = ganttView === 'week' ? 7 : 30

        const woStart = new Date(wo.plannedStartDate)
        const woEnd = new Date(wo.plannedEndDate)
        woStart.setHours(0, 0, 0, 0)
        woEnd.setHours(0, 0, 0, 0)

        const clampedStart = woStart < ganttStart ? ganttStart : woStart
        const clampedEnd = woEnd > ganttEnd ? ganttEnd : woEnd

        const startOffset = Math.round(
            (clampedStart.getTime() - ganttStart.getTime()) / (1000 * 60 * 60 * 24)
        )
        const duration = Math.round(
            (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

        const left = (startOffset / totalDays) * 100
        const width = (duration / totalDays) * 100

        return {
            left: `${left}%`,
            width: `${Math.max(width, 1)}%`,
        }
    }

    const STATUS_BAR_COLORS: Record<string, string> = {
        Draft: '#64748b',
        Released: '#3b82f6',
        InProgress: '#f59e0b',
        Completed: '#22c55e',
        Cancelled: '#ef4444',
    }

    const STATUS_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444']

    const ganttDays = getGanttDays()
    const ganttWorkOrders = workOrders.filter(woOverlapsRange)

    // ── Chart data ─────────────────────────────────────────────────────────
    const totalWO = workOrders.length
    const inProgressWO = workOrders.filter(wo => wo.status === 'InProgress').length
    const completedWO = workOrders.filter(wo => wo.status === 'Completed').length
    const totalItems = items.length

    const statusChartData = [
        { name: 'Draft', value: workOrders.filter(wo => wo.status === 'Draft').length },
        { name: 'Released', value: workOrders.filter(wo => wo.status === 'Released').length },
        { name: 'In Progress', value: inProgressWO },
        { name: 'Completed', value: completedWO },
        { name: 'Cancelled', value: workOrders.filter(wo => wo.status === 'Cancelled').length },
    ]

    const itemTypeChartData = [
        { name: 'Raw Material', value: items.filter(i => i.itemType === 'RawMaterial').length },
        { name: 'Semi-Finished', value: items.filter(i => i.itemType === 'SemiFinished').length },
        { name: 'Final Product', value: items.filter(i => i.itemType === 'FinalProduct').length },
        { name: 'Consumable', value: items.filter(i => i.itemType === 'Consumable').length },
    ]

    function handleWoSuccess() {
        if (!accessToken) return
        getWorkOrders(accessToken, { pageSize: 500 })
            .then(res => setWorkOrders(res.data))
            .catch(err => console.error(err))
    }

    // ── ADMIN / PRODUCTION ENGINEER ────────────────────────────────────────
    if (isAdminOrEngineer) return (
        <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Work Orders', value: totalWO, icon: ClipboardList, color: 'text-blue-500' },
                    { label: 'In Progress', value: inProgressWO, icon: Clock, color: 'text-amber-500' },
                    { label: 'Completed', value: completedWO, icon: CheckCircle, color: 'text-green-500' },
                    { label: 'Total Items', value: totalItems, icon: Package, color: 'text-primary' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border bg-card p-5 flex items-center gap-4">
                        <div className={`${color} bg-muted rounded-lg p-3`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{label}</p>
                            <p className="text-2xl font-bold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gantt Chart */}
            <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Work Orders Timeline</h2>
                    <div className="flex items-center gap-1 rounded-lg border p-1">
                        <button
                            onClick={() => setGanttView('week')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                ganttView === 'week'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setGanttView('month')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                ganttView === 'month'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {Object.entries(STATUS_BAR_COLORS).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                            <span className="text-xs text-muted-foreground">{status}</span>
                        </div>
                    ))}
                </div>

                {ganttWorkOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No work orders in this period.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Day headers */}
                        <div className="flex text-xs text-muted-foreground mb-2 min-w-0">
                            <div className="w-48 shrink-0" />
                            <div className="flex-1 relative h-5">
                                {ganttDays.map((day, i) => (
                                    <span
                                        key={i}
                                        className="absolute text-center"
                                        style={{
                                            left: `${(i / ganttDays.length) * 100}%`,
                                            width: `${(1 / ganttDays.length) * 100}%`,
                                        }}
                                    >
                                        {ganttView === 'week'
                                            ? day.toLocaleDateString('el-GR', { weekday: 'short', day: 'numeric' })
                                            : day.getDate() % 5 === 1
                                                ? day.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })
                                                : ''}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* WO rows */}
                        <div className="space-y-1.5">
                            {ganttWorkOrders.map(wo => (
                                <div key={wo.id} className="flex items-center gap-2">
                                    <div className="w-48 shrink-0 text-xs truncate text-muted-foreground">
                                        <span className="font-mono">{wo.workOrderCode}</span>
                                        <span className="ml-1 text-foreground">{wo.producedItemName}</span>
                                    </div>
                                    <div className="flex-1 relative h-7 bg-muted/40 rounded">
                                        <div
                                            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                                            style={{ left: '0%' }}
                                        />
                                        <div
                                            onClick={() => setSelectedWo(wo)}
                                            className="absolute top-1 bottom-1 rounded text-xs text-white flex items-center px-1.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{
                                                ...getBarStyle(wo),
                                                backgroundColor: STATUS_BAR_COLORS[wo.status] ?? '#64748b',
                                            }}
                                        >
                                            <span className="truncate">{wo.quantity} {wo.unitOfMeasureSymbol}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Work Orders */}
            <div className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-4">Recent Work Orders</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b text-muted-foreground">
                            <th className="text-left py-2 pr-4 font-medium">Code</th>
                            <th className="text-left py-2 pr-4 font-medium">Item</th>
                            <th className="text-left py-2 pr-4 font-medium">Status</th>
                            <th className="text-left py-2 pr-4 font-medium">Qty</th>
                            <th className="text-left py-2 font-medium">Planned Start</th>
                        </tr>
                        </thead>
                        <tbody>
                        {workOrders.slice(0, 8).map(wo => (
                            <tr
                                key={wo.id}
                                onClick={() => setSelectedWo(wo)}
                                className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <td className="py-2 pr-4 font-mono text-xs">{wo.workOrderCode}</td>
                                <td className="py-2 pr-4">{wo.producedItemName}</td>
                                <td className="py-2 pr-4"><StatusBadge status={wo.status} /></td>
                                <td className="py-2 pr-4">{wo.quantity} {wo.unitOfMeasureSymbol}</td>
                                <td className="py-2">{new Date(wo.plannedStartDate).toLocaleDateString('el-GR')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold mb-4">Work Orders by Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={statusChartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--popover-foreground)',
                                    fontSize: '13px',
                                }}
                                labelStyle={{ color: 'var(--popover-foreground)' }}
                                itemStyle={{ color: 'var(--popover-foreground)' }}
                            />
                            <Bar dataKey="value" name="Work Orders" radius={[4, 4, 0, 0]}>
                                {statusChartData.map((_, i) => (
                                    <Cell key={i} fill={STATUS_COLORS[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold mb-4">Items by Type</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={itemTypeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {itemTypeChartData.map((_, i) => (
                                    <Cell key={i} fill={STATUS_COLORS[i]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Work Order Detail Modal */}
            {selectedWo && (
                <WorkOrderDetailModal
                    workOrder={selectedWo}
                    onClose={() => setSelectedWo(null)}
                    onSuccess={() => {
                        setSelectedWo(null)
                        handleWoSuccess()
                    }}
                />
            )}

        </div>
    )

    // ── OPERATOR ───────────────────────────────────────────────────────────
    if (isOperator) {
        const myOperations = workOrders.filter(wo =>
            wo.status === 'Released' || wo.status === 'InProgress'
        )
        const inProgressOps = myOperations.filter(wo => wo.status === 'InProgress').length
        const releasedOps = myOperations.filter(wo => wo.status === 'Released').length

        return (
            <div className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Active Work Orders', value: myOperations.length, icon: ClipboardList, color: 'text-blue-500' },
                        { label: 'In Progress', value: inProgressOps, icon: Clock, color: 'text-amber-500' },
                        { label: 'Released (Pending)', value: releasedOps, icon: Wrench, color: 'text-purple-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="rounded-xl border bg-card p-5 flex items-center gap-4">
                            <div className={`${color} bg-muted rounded-lg p-3`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold mb-4">Active Work Orders</h2>
                    {myOperations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No active work orders at the moment.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b text-muted-foreground">
                                <th className="text-left py-2 pr-4 font-medium">Code</th>
                                <th className="text-left py-2 pr-4 font-medium">Item</th>
                                <th className="text-left py-2 pr-4 font-medium">Status</th>
                                <th className="text-left py-2 pr-4 font-medium">Operations</th>
                                <th className="text-left py-2 font-medium">Planned End</th>
                            </tr>
                            </thead>
                            <tbody>
                            {myOperations.map(wo => (
                                <tr key={wo.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="py-2 pr-4 font-mono text-xs">{wo.workOrderCode}</td>
                                    <td className="py-2 pr-4 font-medium">{wo.producedItemName}</td>
                                    <td className="py-2 pr-4"><StatusBadge status={wo.status} /></td>
                                    <td className="py-2 pr-4">
                                        <span className={`text-xs font-medium ${
                                            wo.completedOperations === wo.totalOperations
                                                ? 'text-green-500'
                                                : 'text-amber-500'
                                        }`}>
                                            {wo.completedOperations} / {wo.totalOperations}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        {new Date(wo.plannedEndDate).toLocaleDateString('el-GR')}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        )
    }

    // ── WAREHOUSE ──────────────────────────────────────────────────────────
    const lowStockItems = items.filter(i =>
        i.stockQuantity < 10 && (i.itemType === 'RawMaterial' || i.itemType === 'Consumable')
    )
    const totalRawMaterials = items.filter(i => i.itemType === 'RawMaterial').length
    const totalConsumables = items.filter(i => i.itemType === 'Consumable').length

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Raw Materials', value: totalRawMaterials, icon: Package, color: 'text-blue-500' },
                    { label: 'Consumables', value: totalConsumables, icon: Package, color: 'text-purple-500' },
                    { label: 'Low Stock Items', value: lowStockItems.length, icon: BarChart2, color: lowStockItems.length > 0 ? 'text-red-500' : 'text-green-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border bg-card p-5 flex items-center gap-4">
                        <div className={`${color} bg-muted rounded-lg p-3`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{label}</p>
                            <p className="text-2xl font-bold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {lowStockItems.length > 0 && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                    <h2 className="font-semibold text-red-500 mb-3">⚠ Low Stock Alert</h2>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b text-muted-foreground">
                            <th className="text-left py-2 pr-4 font-medium">Code</th>
                            <th className="text-left py-2 pr-4 font-medium">Item</th>
                            <th className="text-left py-2 pr-4 font-medium">Type</th>
                            <th className="text-left py-2 font-medium">Stock</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lowStockItems.map(item => (
                            <tr key={item.id} className="border-b last:border-0">
                                <td className="py-2 pr-4 font-mono text-xs">{item.itemCode}</td>
                                <td className="py-2 pr-4 font-medium">{item.name}</td>
                                <td className="py-2 pr-4 text-muted-foreground">{item.itemType}</td>
                                <td className="py-2 font-medium text-red-500">
                                    {item.stockQuantity} {item.unitOfMeasureSymbol}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-4">Inventory Overview</h2>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Code</th>
                        <th className="text-left py-2 pr-4 font-medium">Item</th>
                        <th className="text-left py-2 pr-4 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Stock</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items
                        .filter(i => i.itemType === 'RawMaterial' || i.itemType === 'Consumable')
                        .sort((a, b) => a.stockQuantity - b.stockQuantity)
                        .map(item => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-2 pr-4 font-mono text-xs">{item.itemCode}</td>
                                <td className="py-2 pr-4 font-medium">{item.name}</td>
                                <td className="py-2 pr-4 text-muted-foreground">{item.itemType}</td>
                                <td className={`py-2 font-medium ${item.stockQuantity < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                    {item.stockQuantity} {item.unitOfMeasureSymbol}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
