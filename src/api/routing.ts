import { apiUrl, authHeader, apiFetch } from '@/api/client'
import type { RoutingStepReadOnlyDTO } from '@/types'

export async function getRouting(
    token: string,
    producedItemId: number,
): Promise<RoutingStepReadOnlyDTO[]> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/routing`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch routing')
    return res.json()
}

export interface RoutingStepInsertPayload {
    sequence: number
    operationName: string
    estimatedMinutes: number
    workstationId: number
    machineId?: number
    notes?: string
}

export interface RoutingStepUpdatePayload {
    sequence: number
    operationName: string
    estimatedMinutes: number
    workstationId: number
    machineId?: number
    notes?: string
}

export async function addRoutingStep(
    token: string,
    producedItemId: number,
    payload: RoutingStepInsertPayload,
): Promise<RoutingStepReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/routing`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to add routing step')
    }
    return res.json()
}

export async function updateRoutingStep(
    token: string,
    producedItemId: number,
    stepId: number,
    payload: RoutingStepUpdatePayload,
): Promise<RoutingStepReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/routing/${stepId}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update routing step')
    }
    return res.json()
}

export async function deleteRoutingStep(
    token: string,
    producedItemId: number,
    stepId: number,
): Promise<void> {
    const res = await apiFetch(`${apiUrl('items')}/${producedItemId}/routing/${stepId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to delete routing step')
}

