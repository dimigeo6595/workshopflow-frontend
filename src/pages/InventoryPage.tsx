import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthProvider'
import { getTransactionsByItem, createManualTransaction } from '@/api/inventory'
import { inventoryTransactionSchema, type InventoryTransactionFormFields } from '@/schemas/inventory'
import type { ItemReadOnlyDTO, InventoryTransactionReadOnlyDTO } from '@/types'
import { Warehouse, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ItemAutocomplete from '@/components/ItemAutocomplete'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function InventoryPage() {
    const { accessToken } = useAuth()

    const [selectedItem, setSelectedItem] = useState<ItemReadOnlyDTO | null>(null)
    const [transactions, setTransactions] = useState<InventoryTransactionReadOnlyDTO[]>([])
    const [loadingTx, setLoadingTx] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)

    useEffect(() => {
        if (!accessToken || !selectedItem) {
            return
        }

        const token = accessToken
        const itemId = selectedItem.id
        let cancelled = false

        async function load() {
            setLoadingTx(true)
            try {
                const data = await getTransactionsByItem(token, itemId)
                if (!cancelled) setTransactions(data)
            } catch (err) {
                console.error(err)
            } finally {
                if (!cancelled) setLoadingTx(false)
            }
        }

        void load()

        return () => {
            cancelled = true
        }
    }, [accessToken, selectedItem])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<InventoryTransactionFormFields>({
        resolver: zodResolver(inventoryTransactionSchema),
        defaultValues: { transactionType: 'Purchase' },
    })

    async function onSubmitAdd(data: InventoryTransactionFormFields) {
        if (!accessToken || !selectedItem) return

        try {
            const newTx = await createManualTransaction(accessToken, {
                itemId: selectedItem.id,
                quantity: data.quantity,
                transactionType: data.transactionType,
                notes: data.notes || undefined,
            })
            setTransactions(prev => [newTx, ...prev])
            toast.success('Transaction recorded')
            setShowAddForm(false)
            reset()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to record transaction')
        }
    }

    if (!accessToken) return null

    const isManufactured = selectedItem
        ? selectedItem.itemType === 'SemiFinished' || selectedItem.itemType === 'FinalProduct'
        : false

    return (
        <div className="space-y-4">
            <div className="max-w-md">
                <ItemAutocomplete
                    value={selectedItem}
                    onChange={item => {
                        setSelectedItem(item)
                        setTransactions([])
                        setShowAddForm(false)
                    }}
                    placeholder="Search item to view inventory..."
                />
            </div>

            {!selectedItem ? (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                    <Warehouse className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Select an item to view its inventory history.
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">{selectedItem.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                Current stock: {selectedItem.stockQuantity} {selectedItem.unitOfMeasureSymbol}
                            </p>
                        </div>
                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="w-4 h-4" />
                            Add transaction
                        </Button>
                    </div>

                    {showAddForm && (
                        <form
                            onSubmit={handleSubmit(onSubmitAdd)}
                            className="space-y-3 rounded-lg border p-4"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Quantity</label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        {...register('quantity', { valueAsNumber: true })}
                                    />
                                    {errors.quantity && (
                                        <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Type</label>
                                    <select
                                        {...register('transactionType')}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        {!isManufactured && <option value="Purchase">Purchase</option>}
                                        <option value="Adjustment">Adjustment</option>
                                    </select>
                                    {errors.transactionType && (
                                        <p className="text-sm text-destructive mt-1">{errors.transactionType.message}</p>
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
                                        reset()
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Add'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="rounded-xl border bg-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b bg-muted/50 text-muted-foreground">
                                <th className="text-left py-3 px-4 font-medium">Date</th>
                                <th className="text-left py-3 px-4 font-medium">Type</th>
                                <th className="text-left py-3 px-4 font-medium">Quantity</th>
                                <th className="text-left py-3 px-4 font-medium">Work Order</th>
                                <th className="text-left py-3 px-4 font-medium">By</th>
                                <th className="text-left py-3 px-4 font-medium">Notes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loadingTx ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4">
                                            {new Date(tx.insertedAt).toLocaleDateString('el-GR')}
                                        </td>
                                        <td className="py-3 px-4">{tx.transactionType}</td>
                                        <td className={`py-3 px-4 font-medium ${tx.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.quantity >= 0 ? '+' : ''}{tx.quantity}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-xs">{tx.workOrderCode ?? '—'}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{tx.createdByUsername}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{tx.notes ?? '—'}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}


