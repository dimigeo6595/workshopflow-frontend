import { apiUrl, authHeader, apiFetch } from '@/api/client'
import type { RoleReadOnlyDTO } from '@/types'

export async function getRoles(token: string): Promise<RoleReadOnlyDTO[]> {
    const res = await apiFetch(apiUrl('roles'), {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch roles')
    return res.json()
}


