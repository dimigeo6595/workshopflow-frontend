import type { PaginatedResult, ItemReadOnlyDTO } from '@/types'
import {apiUrl} from "@/api/client.ts";


function authHeader(token: string) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

export async function getItems(
    token: string,
    params?: { name?: string; itemType?: string; pageNumber?: number; pageSize?: number },
): Promise<PaginatedResult<ItemReadOnlyDTO>> {
    const query = new URLSearchParams()
    if (params?.name) query.set('name', params.name)
    if (params?.itemType) query.set('itemType', params.itemType)
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))

    const res = await fetch(apiUrl('workorders'), {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch items')
    return res.json()
}
