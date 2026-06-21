import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getWorkOrders } from '@/api/workorders'
import { getItems } from '@/api/items'
import type { WorkOrderReadOnlyDTO, ItemReadOnlyDTO } from '@/types'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ClipboardList, Package, CheckCircle, Clock } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'

export default function DashboardPage() {
    const { accessToken } = useAuth()

    const [workOrders, setWorkOrders] = useState<WorkOrderReadOnlyDTO[]>([])
    const [items, setItems] = useState<ItemReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!accessToken) return

        const fetchData = async () => {
            try {
                const [woRes, itemsRes] = await Promise.all([
                    getWorkOrders(accessToken, { pageSize: 100 }),
                    getItems(accessToken, { pageSize: 100 }),
                ])
                setWorkOrders(woRes.data)
                setItems(itemsRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [accessToken])

    const totalWO = workOrders.length
    const inProgressWO = workOrders.filter(wo => wo.status === 'InProgress').length
    const completedWO = workOrders.filter(wo => wo.status === 'Completed').length
    const draftWO = workOrders.filter(wo => wo.status === 'Draft').length
    const totalItems = items.length

    const statusChartData = [
        { name: 'Draft', value: draftWO },
        { name: 'Released', value: workOrders.filter(wo => wo.status === 'Released').length },
        { name: 'In Progress', value: inProgressWO },
        { name: 'Completed', value: completedWO },
        { name: 'Cancelled', value: workOrders.filter(wo => wo.status === 'Cancelled').length },
    ]

    const STATUS_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444']

    const itemTypeChartData = [
        { name: 'Raw Material', value: items.filter(i => i.itemType === 'RawMaterial').length },
        { name: 'Semi-Finished', value: items.filter(i => i.itemType === 'SemiFinished').length },
        { name: 'Final Product', value: items.filter(i => i.itemType === 'FinalProduct').length },
        { name: 'Consumable', value: items.filter(i => i.itemType === 'Consumable').length },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Bar chart — Work Order status */}
                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold mb-4">Work Orders by Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={statusChartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 8 }}
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

                {/* Pie chart — Item types */}
                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold mb-4">Items by Type</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={itemTypeChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
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
                            <tr key={wo.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-2 pr-4 font-mono text-xs">{wo.workOrderCode}</td>
                                <td className="py-2 pr-4">{wo.producedItemName}</td>
                                <td className="py-2 pr-4">
                                    <StatusBadge status={wo.status} />
                                </td>
                                <td className="py-2 pr-4">{wo.quantity} {wo.unitOfMeasureSymbol}</td>
                                <td className="py-2">{new Date(wo.plannedStartDate).toLocaleDateString('el-GR')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
