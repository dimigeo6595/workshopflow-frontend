import { apiUrl, authHeader } from '@/api/client'
import type { InventoryTransactionReadOnlyDTO } from '@/types'

export async function getTransactionsByItem(
    token: string,
    itemId: number,
): Promise<InventoryTransactionReadOnlyDTO[]> {
    const res = await fetch(`${apiUrl('inventory')}/items/${itemId}`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch inventory transactions')
    return res.json()
}

export interface InventoryTransactionInsertPayload {
    itemId: number
    quantity: number
    transactionType: 'Purchase' | 'Adjustment'
    notes?: string
}

export async function createManualTransaction(
    token: string,
    payload: InventoryTransactionInsertPayload,
): Promise<InventoryTransactionReadOnlyDTO> {
    const res = await fetch(apiUrl('inventory'), {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to create transaction')
    }

    return res.json()
}

