import { apiUrl, authHeader, apiFetch } from '@/api/client'
import type { BomLineReadOnlyDTO } from '@/types'

export async function getBom(
    token: string,
    producedItemId: number,
): Promise<BomLineReadOnlyDTO[]> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/bom`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch BOM')
    return res.json()
}

export interface BomLineInsertPayload {
    componentItemId: number
    quantity: number
    unitOfMeasureId: number
    notes?: string
}

export interface BomLineUpdatePayload {
    quantity: number
    notes?: string
}

export async function addBomLine(
    token: string,
    producedItemId: number,
    payload: BomLineInsertPayload,
): Promise<BomLineReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/bom`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to add component')
    }
    return res.json()
}

export async function updateBomLine(
    token: string,
    producedItemId: number,
    bomLineId: number,
    payload: BomLineUpdatePayload,
): Promise<BomLineReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/bom/${bomLineId}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update component')
    }
    return res.json()
}

export async function deleteBomLine(
    token: string,
    producedItemId: number,
    bomLineId: number,
): Promise<void> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/bom/${bomLineId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to delete component')
}
