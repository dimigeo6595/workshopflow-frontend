import { apiUrl, authHeader, apiFetch } from '@/api/client'
import type { UoMReadOnlyDTO } from '@/types'

export async function getUoMs(token: string): Promise<UoMReadOnlyDTO[]> {
    const res = await apiFetch(apiUrl('uom'), {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch units of measure')
    return res.json()
}
