import { apiUrl, authHeader } from '@/api/client'
import type { WorkstationReadOnlyDTO, MachineReadOnlyDTO } from '@/types'

export async function getWorkstations(token: string): Promise<WorkstationReadOnlyDTO[]> {
    const res = await fetch(apiUrl('workstations'), {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch workstations')
    return res.json()
}

export async function getMachines(
    token: string,
    workstationId: number,
): Promise<MachineReadOnlyDTO[]> {
    const res = await fetch(`${apiUrl('workstations')}/${workstationId}/machines`, {
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to fetch machines')
    return res.json()
}

export interface WorkstationInsertPayload {
    code: string
    name: string
    notes?: string
}

export interface WorkstationUpdatePayload {
    name: string
    notes?: string
}

export async function createWorkstation(
    token: string,
    payload: WorkstationInsertPayload,
): Promise<WorkstationReadOnlyDTO> {
    const res = await fetch(apiUrl('workstations'), {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to create workstation')
    }
    return res.json()
}

export async function updateWorkstation(
    token: string,
    id: number,
    payload: WorkstationUpdatePayload,
): Promise<WorkstationReadOnlyDTO> {
    const res = await fetch(`${apiUrl('workstations')}/${id}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update workstation')
    }
    return res.json()
}

export async function deleteWorkstation(token: string, id: number): Promise<void> {
    const res = await fetch(`${apiUrl('workstations')}/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to delete workstation')
}

export interface MachineInsertPayload {
    code: string
    name: string
    workstationId: number
    notes?: string
}

export interface MachineUpdatePayload {
    name: string
    workstationId: number
    notes?: string
}

export async function createMachine(
    token: string,
    workstationId: number,
    payload: MachineInsertPayload,
): Promise<MachineReadOnlyDTO> {
    const res = await fetch(`${apiUrl('workstations')}/${workstationId}/machines`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to create machine')
    }
    return res.json()
}

export async function updateMachine(
    token: string,
    workstationId: number,
    machineId: number,
    payload: MachineUpdatePayload,
): Promise<MachineReadOnlyDTO> {
    const res = await fetch(`${apiUrl('workstations')}/${workstationId}/machines/${machineId}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail ?? data?.message ?? 'Failed to update machine')
    }
    return res.json()
}

export async function deleteMachine(
    token: string,
    workstationId: number,
    machineId: number,
): Promise<void> {
    const res = await fetch(`${apiUrl('workstations')}/${workstationId}/machines/${machineId}`, {
        method: 'DELETE',
        headers: authHeader(token),
    })

    if (!res.ok) throw new Error('Failed to delete machine')
}

