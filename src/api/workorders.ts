import {apiUrl} from "@/api/client.ts";
import type { PaginatedResult, WorkOrderReadOnlyDTO, WorkOrderOperationReadOnlyDTO } from '@/types'

function authHeader(token: string) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

export async function getWorkOrders(
    token: string,
    params?: { status?: string; producedItemId?: number; pageNumber?: number; pageSize?: number },
): Promise<PaginatedResult<WorkOrderReadOnlyDTO>> {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.producedItemId) query.set('producedItemId', String(params.producedItemId))
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))

    const res = await fetch(apiUrl('workorders'), {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch work orders')
    return res.json()
}

export interface WorkOrderInsertPayload {
    producedItemId: number
    quantity: number
    plannedStartDate: string
    plannedEndDate: string
    notes?: string
}

export interface WorkOrderUpdatePayload {
    plannedStartDate: string
    plannedEndDate: string
    notes?: string
}

export async function createWorkOrder(
    token: string,
    payload: WorkOrderInsertPayload,
): Promise<WorkOrderReadOnlyDTO> {
    const res = await fetch(apiUrl('workorders'), {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to create work order')
    }
    return res.json()
}

export async function updateWorkOrder(
    token: string,
    id: number,
    payload: WorkOrderUpdatePayload,
): Promise<WorkOrderReadOnlyDTO> {
    const res = await fetch(`${apiUrl('workorders')}/${id}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update work order')
    }
    return res.json()
}

export async function deleteWorkOrder(token: string, id: number): Promise<void> {
    const res = await fetch(`${apiUrl('workorders')}/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to delete work order')
}

export async function releaseWorkOrder(token: string, id: number): Promise<WorkOrderReadOnlyDTO> {
    const res = await fetch(`${apiUrl('workorders')}/${id}/release`, {
        method: 'POST',
        headers: authHeader(token),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to release work order')
    }
    return res.json()
}

export async function cancelWorkOrder(token: string, id: number): Promise<void> {
    const res = await fetch(`${apiUrl('workorders')}/${id}/cancel`, {
        method: 'POST',
        headers: authHeader(token),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to cancel work order')
    }
}

export async function getOperations(
    token: string,
    workOrderId: number,
): Promise<WorkOrderOperationReadOnlyDTO[]> {
    const res = await fetch(`${apiUrl('workorders')}/${workOrderId}/operations`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch operations')
    return res.json()
}

export async function assignOperation(
    token: string,
    workOrderId: number,
    operationId: number,
    assignedToUserId: number,
): Promise<WorkOrderOperationReadOnlyDTO> {
    const res = await fetch(
        `${apiUrl('workorders')}/${workOrderId}/operations/${operationId}/assign`,
        {
            method: 'PATCH',
            headers: authHeader(token),
            body: JSON.stringify({ assignedToUserId }),
        },
    )

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to assign operation')
    }
    return res.json()
}

export async function startOperation(
    token: string,
    workOrderId: number,
    operationId: number,
): Promise<WorkOrderOperationReadOnlyDTO> {
    const res = await fetch(
        `${apiUrl('workorders')}/${workOrderId}/operations/${operationId}/start`,
        {
            method: 'PATCH',
            headers: authHeader(token),
        },
    )

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to start operation')
    }
    return res.json()
}

export async function completeOperation(
    token: string,
    workOrderId: number,
    operationId: number,
): Promise<WorkOrderOperationReadOnlyDTO> {
    const res = await fetch(
        `${apiUrl('workorders')}/${workOrderId}/operations/${operationId}/complete`,
        {
            method: 'PATCH',
            headers: authHeader(token),
        },
    )

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to complete operation')
    }
    return res.json()
}

