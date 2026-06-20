import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getItems } from '@/api/items'
import { useDebounce } from '@/hooks/useDebounce'
import type { ItemReadOnlyDTO } from '@/types'
import { Search } from 'lucide-react'

interface ItemAutocompleteProps {
    value: ItemReadOnlyDTO | null
    onChange: (item: ItemReadOnlyDTO) => void
    excludeItemId?: number   // για να μην επιλέξει το ίδιο item ως δικό του component
    placeholder?: string
}

export default function ItemAutocomplete({
                                             value,
                                             onChange,
                                             excludeItemId,
                                             placeholder = 'Search item by name or code...',
                                         }: ItemAutocompleteProps) {
    const { accessToken } = useAuth()

    const [query, setQuery] = useState('')
    const [results, setResults] = useState<ItemReadOnlyDTO[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
        if (!accessToken || debouncedQuery.length < 2) {
            return
        }

        let cancelled = false

        getItems(accessToken, { name: debouncedQuery, pageSize: 10 })
            .then(res => {
                if (cancelled) return
                const filtered = excludeItemId
                    ? res.data.filter(item => item.id !== excludeItemId)
                    : res.data
                setResults(filtered)
            })
            .catch(err => console.error(err))

        return () => {
            cancelled = true
        }
    }, [accessToken, debouncedQuery, excludeItemId])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function handleSelect(item: ItemReadOnlyDTO) {
        onChange(item)
        setQuery('')
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            {value ? (
                <div className="flex items-center justify-between rounded-md border border-input px-3 h-9 bg-muted/30">
          <span className="text-sm">
            {value.name} <span className="text-muted-foreground font-mono text-xs">({value.itemCode})</span>
          </span>
                    <button
                        type="button"
                        onClick={() => onChange(null as never)}
                        className="text-muted-foreground hover:text-foreground text-xs"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder={placeholder}
                            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {isOpen && results.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
                            {results.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                                >
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground font-mono text-xs">{item.itemCode}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

