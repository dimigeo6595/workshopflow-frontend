import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router'
import { toast } from 'sonner'
import { Factory } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'
import { type LoginFields, loginSchema } from '@/schemas/auth'

// shadcn/ui primitives (copy from teacher's ui folder or install via shadcn CLI)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

export default function LoginPage() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect back to where the user came from (ProtectedRoute saves it)
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFields) => {
    try {
      await loginUser(data)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="bg-primary rounded-xl p-3">
            <Factory className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">WorkshopFlow</h1>
          <p className="text-sm text-muted-foreground">Manufacturing ERP</p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 border rounded-xl bg-card p-8 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Sign in to your account</h2>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          WorkshopFlow v1.0 · &copy; 2026
        </p>
      </div>
    </div>
  )
}
