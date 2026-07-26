import type { PaginatedResult, ItemReadOnlyDTO } from '@/types'
import { apiUrl, authHeader, apiFetch } from '@/api/client'

export async function getItems(
    token: string,
    params?: {
        name?: string
        itemType?: string
        pageNumber?: number
        pageSize?: number
        sortBy?: string
        sortDescending?: boolean
    },
): Promise<PaginatedResult<ItemReadOnlyDTO>> {
    const query = new URLSearchParams()
    if (params?.name) query.set('name', params.name)
    if (params?.itemType) query.set('itemType', params.itemType)
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    if (params?.sortBy) query.set('sortBy', params.sortBy)
    if (params?.sortDescending) query.set('sortDescending', String(params.sortDescending))

    const res = await apiFetch(`${apiUrl('items')}?${query}`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch items')
    return res.json()
}

export async function deleteItem(token: string, id: number): Promise<void> {
    const res = await apiFetch(`${apiUrl('items')}/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to delete item')
}

export interface ItemInsertPayload {
    itemCode: string
    name: string
    description?: string
    itemType: string
    weightPerUoM?: number
    unitOfMeasureId: number
    weightUoMId?: number
}

export interface ItemUpdatePayload {
    name: string
    description?: string
    itemType: string
    weightPerUoM?: number
    unitOfMeasureId: number
    weightUoMId?: number
}

export async function createItem(
    token: string,
    payload: ItemInsertPayload,
): Promise<ItemReadOnlyDTO> {
    const res = await apiFetch(apiUrl('items'), {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to create item')
    }

    return res.json()
}

export async function updateItem(
    token: string,
    id: number,
    payload: ItemUpdatePayload,
): Promise<ItemReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('items')}/${id}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update item')
    }

    return res.json()
}

export async function calculateWeight(
    token: string,
    itemId: number,
): Promise<ItemReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('items')}/${itemId}/calculate-weight`, {
        method: 'POST',
        headers: authHeader(token),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to calculate weight')
    }

    return res.json()
}