import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getUsers, deleteUser } from '@/api/users'
import { getRoles } from '@/api/roles'
import type { UserReadOnlyDTO, RoleReadOnlyDTO } from '@/types'
import { Users, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import UserFormModal from '@/components/UserFormModal'

export default function UsersPage() {
    const { accessToken, user: currentUser } = useAuth()

    const [users, setUsers] = useState<UserReadOnlyDTO[]>([])
    const [roles, setRoles] = useState<RoleReadOnlyDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [filterUsername, setFilterUsername] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserReadOnlyDTO | null>(null)

    useEffect(() => {
        if (!accessToken) return
        getRoles(accessToken).then(setRoles).catch(err => console.error(err))
    }, [accessToken])

    useEffect(() => {
        if (!accessToken) return

        const token = accessToken
        let cancelled = false

        async function load() {
            setLoading(true)
            try {
                const res = await getUsers(token, {
                    username: filterUsername || undefined,
                    userRole: filterRole || undefined,
                    pageNumber,
                    pageSize: 20,
                })
                if (!cancelled) {
                    setUsers(res.data)
                    setTotalPages(res.totalPages)
                }
            } catch (err) {
                console.error(err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void load()

        return () => {
            cancelled = true
        }
    }, [accessToken, filterUsername, filterRole, pageNumber])


    function handleModalSuccess() {
        if (!accessToken) return
        getUsers(accessToken, {
            username: filterUsername || undefined,
            userRole: filterRole || undefined,
            pageNumber,
            pageSize: 20,
        })
            .then(res => {
                setUsers(res.data)
                setTotalPages(res.totalPages)
            })
            .catch(err => console.error(err))
    }

    function handleOpenCreate() {
        setEditingUser(null)
        setModalOpen(true)
    }

    function handleOpenEdit(u: UserReadOnlyDTO) {
        setEditingUser(u)
        setModalOpen(true)
    }

    async function handleDelete(id: number, username: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return

        try {
            await deleteUser(accessToken, id)
            toast.success('User deleted')
            handleModalSuccess()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete user')
        }
    }


    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4" />
                    New User
                </Button>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search username..."
                        value={filterUsername}
                        onChange={e => {
                            setFilterUsername(e.target.value)
                            setPageNumber(1)
                        }}
                        className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />

                    <select
                        value={filterRole}
                        onChange={e => {
                            setFilterRole(e.target.value)
                            setPageNumber(1)
                        }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Roles</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.name}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                        <th className="text-left py-3 px-4 font-medium">Username</th>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map(u => (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-medium">{u.username}</td>
                                <td className="py-3 px-4">{u.firstname} {u.lastname}</td>
                                <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                                <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted">
                      {u.role}
                    </span>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenEdit(u)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Edit user"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    {Number(currentUser?.userId) !== u.id && (
                                        <button
                                            onClick={() => handleDelete(u.id, u.username)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            aria-label="Delete user"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pageNumber} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            disabled={pageNumber === 1}
                            className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <button
                            onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                            disabled={pageNumber === totalPages}
                            className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && (
                <UserFormModal
                    user={editingUser}
                    roles={roles}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleModalSuccess}
                />
            )}


        </div>
    )
}