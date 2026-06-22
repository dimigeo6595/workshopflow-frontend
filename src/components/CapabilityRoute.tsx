import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/context/AuthProvider'
import type { Capability } from '@/types'

interface CapabilityRouteProps {
    capability: Capability
    redirectTo?: string
}

export default function CapabilityRoute({
                                            capability,
                                            redirectTo = '/dashboard',
                                        }: CapabilityRouteProps) {
    const { hasCapability } = useAuth()

    if (!hasCapability(capability)) {
        return <Navigate to={redirectTo} replace />
    }

    return <Outlet />
}

