import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import {
    getWorkstations,
    getMachines,
    deleteWorkstation,
    deleteMachine,
} from '@/api/workstations'
import type { WorkstationReadOnlyDTO, MachineReadOnlyDTO } from '@/types'
import { Wrench, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import WorkstationFormModal from '@/components/WorkstationFormModal'
import MachineFormModal from '@/components/MachineFormModal'
import { Pencil } from 'lucide-react'
import React from 'react'

export default function WorkstationsPage() {
    const { accessToken, hasCapability } = useAuth()

    const [workstations, setWorkstations] = useState<WorkstationReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [machinesByWorkstation, setMachinesByWorkstation] = useState<Record<number, MachineReadOnlyDTO[]>>({})
    const [loadingMachines, setLoadingMachines] = useState(false)
    const [wsModalOpen, setWsModalOpen] = useState(false)
    const [editingWs, setEditingWs] = useState<WorkstationReadOnlyDTO | null>(null)
    const [machineModalOpen, setMachineModalOpen] = useState(false)
    const [machineModalWsId, setMachineModalWsId] = useState<number | null>(null)
    const [editingMachine, setEditingMachine] = useState<MachineReadOnlyDTO | null>(null)

    useEffect(() => {
        if (!accessToken) return

        getWorkstations(accessToken)
            .then(setWorkstations)
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [accessToken])

    async function handleToggle(workstationId: number) {
        if (expandedId === workstationId) {
            setExpandedId(null)
            return
        }

        setExpandedId(workstationId)

        if (machinesByWorkstation[workstationId]) {
            return // already cached, no need to refetch
        }

        if (!accessToken) return

        setLoadingMachines(true)
        try {
            const machines = await getMachines(accessToken, workstationId)
            setMachinesByWorkstation(prev => ({...prev, [workstationId]: machines}))
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingMachines(false)
        }
    }


    async function handleDeleteWorkstation(id: number, name: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete workstation "${name}"? This cannot be undone if it has no routing steps.`)) return

        try {
            await deleteWorkstation(accessToken, id)
            toast.success('Workstation deleted')
            setWorkstations(prev => prev.filter(ws => ws.id !== id))
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete workstation')
        }
    }

    async function handleDeleteMachine(workstationId: number, machineId: number, name: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete machine "${name}"?`)) return

        try {
            await deleteMachine(accessToken, workstationId, machineId)
            toast.success('Machine deleted')
            setMachinesByWorkstation(prev => ({
                ...prev,
                [workstationId]: prev[workstationId].filter(m => m.id !== machineId),
            }))
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete machine')
        }
    }

    function handleOpenCreateWs() {
        setEditingWs(null)
        setWsModalOpen(true)
    }

    function handleOpenEditWs(ws: WorkstationReadOnlyDTO) {
        setEditingWs(ws)
        setWsModalOpen(true)
    }

    function handleWsModalSuccess() {
        if (!accessToken) return
        getWorkstations(accessToken).then(setWorkstations).catch(err => console.error(err))
    }

    function handleOpenCreateMachine(workstationId: number) {
        setMachineModalWsId(workstationId)
        setEditingMachine(null)
        setMachineModalOpen(true)
    }

    function handleOpenEditMachine(workstationId: number, machine: MachineReadOnlyDTO) {
        setMachineModalWsId(workstationId)
        setEditingMachine(machine)
        setMachineModalOpen(true)
    }

    async function handleMachineModalSuccess() {
        if (!accessToken || machineModalWsId === null) return
        try {
            const machines = await getMachines(accessToken, machineModalWsId)
            setMachinesByWorkstation(prev => ({ ...prev, [machineModalWsId]: machines }))
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                {hasCapability('EDIT_MACHINES') && (
                    <Button onClick={handleOpenCreateWs}>
                        <Plus className="w-4 h-4" />
                        New Workstation
                    </Button>
                )}
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                        <th className="w-8"></th>
                        <th className="text-left py-3 px-4 font-medium">Code</th>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Notes</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {workstations.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                                No workstations found
                            </td>
                        </tr>
                    ) : (
                        workstations.map(ws => (
                            <React.Fragment key={ws.id}>
                            <>
                                <tr
                                    onClick={() => handleToggle(ws.id)}
                                    className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {expandedId === ws.id ? (
                                            <ChevronDown className="w-4 h-4"/>
                                        ) : (
                                            <ChevronRight className="w-4 h-4"/>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-xs">{ws.code}</td>
                                    <td className="py-3 px-4 font-medium">{ws.name}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{ws.notes ?? '—'}</td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        {hasCapability('EDIT_MACHINES') && (
                                            <>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        handleOpenEditWs(ws)
                                                    }}
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label="Edit workstation"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        handleDeleteWorkstation(ws.id, ws.name)
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                    aria-label="Delete workstation"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>

                                {expandedId === ws.id && (
                                    <tr key={`${ws.id}-machines`} className="border-b last:border-0 bg-muted/20">
                                        <td colSpan={5} className="px-4 py-3">
                                            <div className="pl-8 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-muted-foreground">Machines</h4>
                                                    {hasCapability('EDIT_MACHINES') && (
                                                        <Button size="sm" variant="secondary" onClick={() => handleOpenCreateMachine(ws.id)}>
                                                            <Plus className="w-3.5 h-3.5" />
                                                            Add machine
                                                        </Button>
                                                    )}
                                                </div>

                                                {loadingMachines ? (
                                                    <p className="text-sm text-muted-foreground py-2">Loading...</p>
                                                ) : !machinesByWorkstation[ws.id] || machinesByWorkstation[ws.id].length === 0 ? (
                                                    <p className="text-sm text-muted-foreground py-2">No machines
                                                        yet.</p>
                                                ) : (
                                                    machinesByWorkstation[ws.id].map(machine => (
                                                        <div
                                                            key={machine.id}
                                                            className="flex items-center justify-between rounded-md border px-3 py-2 bg-card"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {machine.name}{' '}
                                                                    <span
                                                                        className="text-muted-foreground font-mono text-xs">
                                      ({machine.code})
                                    </span>
                                                                </p>
                                                                {machine.notes && (
                                                                    <p className="text-xs text-muted-foreground">{machine.notes}</p>
                                                                )}
                                                            </div>
                                                            {hasCapability('EDIT_MACHINES') && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleOpenEditMachine(ws.id, machine)}
                                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                                        aria-label="Edit machine"
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMachine(ws.id, machine.id, machine.name)}
                                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                                        aria-label="Delete machine"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </>
                            </React.Fragment>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {wsModalOpen && (
                <WorkstationFormModal
                    workstation={editingWs}
                    onClose={() => setWsModalOpen(false)}
                    onSuccess={handleWsModalSuccess}
                />
            )}

            {machineModalOpen && machineModalWsId !== null && (
                <MachineFormModal
                    workstationId={machineModalWsId}
                    machine={editingMachine}
                    onClose={() => setMachineModalOpen(false)}
                    onSuccess={handleMachineModalSuccess}
                />
            )}
        </div>
    )

}








