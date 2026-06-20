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

