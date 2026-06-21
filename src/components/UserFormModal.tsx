import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'
import { userSchema, type UserFormFields } from '@/schemas/users'
import { createUser, updateUser } from '@/api/users'
import type { UserReadOnlyDTO, RoleReadOnlyDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

interface UserFormModalProps {
    user: UserReadOnlyDTO | null
    roles: RoleReadOnlyDTO[]
    onClose: () => void
    onSuccess: () => void
}

export default function UserFormModal({ user, roles, onClose, onSuccess }: UserFormModalProps) {
    const { accessToken } = useAuth()
    const isEditMode = user !== null

    const matchingRole = user ? roles.find(r => r.name === user.role) : undefined

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserFormFields>({
        resolver: zodResolver(userSchema),
        defaultValues: user
            ? {
                username: user.username,
                email: user.email,
                password: '',
                firstname: user.firstname,
                lastname: user.lastname,
                roleId: matchingRole?.id ?? 0,
            }
            : { username: '', email: '', password: '', firstname: '', lastname: '', roleId: 0 },
    })

    const onSubmit = async (data: UserFormFields) => {
        if (!accessToken) return

        if (!isEditMode && !data.password) {
            toast.error('Password is required')
            return
        }

        try {
            if (isEditMode && user) {
                await updateUser(accessToken, user.id, {
                    email: data.email,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    roleId: data.roleId,
                })
                toast.success('User updated')
            } else {
                await createUser(accessToken, {
                    username: data.username,
                    email: data.email,
                    password: data.password!,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    roleId: data.roleId,
                })
                toast.success('User created')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border bg-card shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">{isEditMode ? 'Edit User' : 'New User'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input id="username" disabled={isEditMode} {...register('username')} />
                        {errors.username && (
                            <p className="text-sm text-destructive">{errors.username.message}</p>
                        )}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <FieldLabel htmlFor="firstname">First name</FieldLabel>
                            <Input id="firstname" {...register('firstname')} />
                            {errors.firstname && (
                                <p className="text-sm text-destructive">{errors.firstname.message}</p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="lastname">Last name</FieldLabel>
                            <Input id="lastname" {...register('lastname')} />
                            {errors.lastname && (
                                <p className="text-sm text-destructive">{errors.lastname.message}</p>
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </Field>

                    {!isEditMode && (
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </Field>
                    )}

                    <Field>
                        <FieldLabel htmlFor="roleId">Role</FieldLabel>
                        <select
                            id="roleId"
                            {...register('roleId', { valueAsNumber: true })}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value={0}>Select a role...</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                        {errors.roleId && <p className="text-sm text-destructive">{errors.roleId.message}</p>}
                    </Field>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create user'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}