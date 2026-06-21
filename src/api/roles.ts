import { apiUrl, authHeader } from '@/api/client'
import type { RoleReadOnlyDTO } from '@/types'

export async function getRoles(token: string): Promise<RoleReadOnlyDTO[]> {
    const res = await fetch(apiUrl('roles'), {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch roles')
    return res.json()
}


