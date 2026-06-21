import { apiUrl, authHeader } from '@/api/client'
import type { PaginatedResult, UserReadOnlyDTO } from '@/types'

export async function getUsers(
    token: string,
    params?: { username?: string; email?: string; userRole?: string; pageNumber?: number; pageSize?: number },
): Promise<PaginatedResult<UserReadOnlyDTO>> {
    const query = new URLSearchParams()
    if (params?.username) query.set('username', params.username)
    if (params?.email) query.set('email', params.email)
    if (params?.userRole) query.set('userRole', params.userRole)
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))

    const res = await fetch(`${apiUrl('users')}?${query}`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
}
