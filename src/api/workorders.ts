import type { PaginatedResult, WorkOrderReadOnlyDTO } from '@/types'
import {apiUrl} from "@/api/client.ts";

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
