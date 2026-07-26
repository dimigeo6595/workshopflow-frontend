import { apiUrl, authHeader, apiFetch } from '@/api/client'
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

    const res = await apiFetch(`${apiUrl('users')}?${query}`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
}

export interface UserInsertPayload {
    username: string
    email: string
    password: string
    firstname: string
    lastname: string
    roleId: number
}

export interface UserUpdatePayload {
    email: string
    firstname: string
    lastname: string
    roleId: number
}

export async function createUser(
    token: string,
    payload: UserInsertPayload,
): Promise<UserReadOnlyDTO> {
    const res = await apiFetch(apiUrl('users'), {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to create user')
    }
    return res.json()
}

export async function updateUser(
    token: string,
    id: number,
    payload: UserUpdatePayload,
): Promise<UserReadOnlyDTO> {
    const res = await apiFetch(`${apiUrl('users')}/${id}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update user')
    }
    return res.json()
}

export async function deleteUser(token: string, id: number): Promise<void> {
    const res = await apiFetch(`${apiUrl('users')}/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to delete user')
    }
}
