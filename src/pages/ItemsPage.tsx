import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import type { ItemReadOnlyDTO } from '@/types'
import { Package, ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { getItems, deleteItem } from '@/api/items'
import { toast } from 'sonner'
import ItemFormModal from '@/components/ItemFormModal'
import { Button } from '@/components/ui/button'


export default function ItemsPage() {
    const { accessToken } = useAuth()

    const [items, setItems] = useState<ItemReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [searchName, setSearchName] = useState('')
    const [filterType, setFilterType] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortBy, setSortBy] = useState('itemCode')
    const [sortDescending, setSortDescending] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ItemReadOnlyDTO | null>(null)


    const debouncedSearch = useDebounce(searchName, 400)

    useEffect(() => {
        if (!accessToken) return

        const fetchItems = async () => {
            try {
                const res = await getItems(accessToken, {
                    pageNumber,
                    pageSize: 20,
                    name: debouncedSearch || undefined,
                    itemType: filterType || undefined,
                    sortBy,
                    sortDescending,
                })
                setItems(res.data)
                setTotalPages(res.totalPages)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchItems()
    }, [accessToken, debouncedSearch, filterType, pageNumber, sortBy, sortDescending])

    function handleSort(column: string) {
        if (sortBy === column) {
            setSortDescending(d => !d)
        } else {
            setSortBy(column)
            setSortDescending(false)
        }
        setPageNumber(1)
    }

    async function handleDelete(id: number, name: string) {
        if (!accessToken) return
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

        try {
            await deleteItem(accessToken, id)
            toast.success('Item deleted')
            setItems(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            toast.error('Failed to delete item')
            console.error(err)
        }
    }


    function handleOpenCreate() {
        setEditingItem(null)
        setModalOpen(true)
    }

    function handleOpenEdit(item: ItemReadOnlyDTO) {
        setEditingItem(item)
        setModalOpen(true)
    }

    function handleCloseModal() {
        setModalOpen(false)
        setEditingItem(null)
    }

    function handleModalSuccess() {
        // Ξανακαλούμε το ίδιο fetch που κάνει το useEffect, με τα τρέχοντα filters
        if (!accessToken) return
        getItems(accessToken, {
            pageNumber,
            pageSize: 20,
            name: debouncedSearch || undefined,
            itemType: filterType || undefined,
            sortBy,
            sortDescending,
        })
            .then(res => {
                setItems(res.data)
                setTotalPages(res.totalPages)
            })
            .catch(err => console.error(err))
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
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4" />
                    New Item
                </Button>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={e => {
                            setSearchName(e.target.value)
                            setPageNumber(1)
                        }}
                        className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />

                    <select
                        value={filterType}
                        onChange={e => {
                            setFilterType(e.target.value)
                            setPageNumber(1)
                        }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Types</option>
                        <option value="RawMaterial">Raw Material</option>
                        <option value="SemiFinished">Semi-Finished</option>
                        <option value="FinalProduct">Final Product</option>
                        <option value="Consumable">Consumable</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                        <th
                            onClick={() => handleSort('itemCode')}
                            className="text-left py-3 px-4 font-medium cursor-pointer hover:text-foreground select-none"
                        >
                            Code {sortBy === 'itemCode' && (sortDescending ? '↓' : '↑')}
                        </th>
                        <th
                            onClick={() => handleSort('name')}
                            className="text-left py-3 px-4 font-medium cursor-pointer hover:text-foreground select-none"
                        >
                            Name {sortBy === 'name' && (sortDescending ? '↓' : '↑')}
                        </th>
                        <th
                            onClick={() => handleSort('itemType')}
                            className="text-left py-3 px-4 font-medium cursor-pointer hover:text-foreground select-none"
                        >
                            Type {sortBy === 'itemType' && (sortDescending ? '↓' : '↑')}
                        </th>
                        <th
                            onClick={() => handleSort('stockQuantity')}
                            className="text-left py-3 px-4 font-medium cursor-pointer hover:text-foreground select-none"
                        >
                            Stock {sortBy === 'stockQuantity' && (sortDescending ? '↓' : '↑')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium">UoM</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No items found
                            </td>
                        </tr>
                    ) : (
                        items.map(item => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-mono text-xs">{item.itemCode}</td>
                                <td className="py-3 px-4 font-medium">
                                    <button
                                        onClick={() => handleOpenEdit(item)}
                                        className="hover:underline hover:text-primary transition-colors text-left"
                                    >
                                        {item.name}
                                    </button>
                                </td>
                                <td className="py-3 px-4">{item.itemType}</td>
                                <td className="py-3 px-4">
                                    {item.stockQuantity} {item.unitOfMeasureSymbol}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">{item.unitOfMeasureSymbol}</td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => handleDelete(item.id, item.name)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                        aria-label="Delete item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
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

            {/* Create/Edit modal */}
            {modalOpen && (
                <ItemFormModal
                    item={editingItem}
                    onClose={handleCloseModal}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    )
}