import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { deleteCookie, getCookie, setCookie } from '@/utils/cookies'
import { login } from '@/api/auth'
import type { LoginFields } from '@/schemas/auth'
import type { AuthUser, Capability, JwtPayload, UserRole } from '@/types'


// ─── Context shape ────────────────────────────────────────────────────────────

type AuthContextProps = {
  isAuthenticated: boolean
  accessToken: string | null
  user: AuthUser | null
  loginUser: (fields: LoginFields) => Promise<void>
  logoutUser: () => void
  hasCapability: (cap: Capability) => boolean
}

// ─── JWT helpers ──────────────────────────────────────────────────────────────

function parseUserFromToken(token: string | null): AuthUser | null {
  if (!token) return null
  try {
    const payload = jwtDecode<JwtPayload>(token)

    // .NET uses long claim type URIs
    const userId =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    const username =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
    const email =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as UserRole
    const rawCap = payload.capability
    const capabilities: Capability[] = rawCap
      ? Array.isArray(rawCap)
        ? (rawCap as Capability[])
        : [rawCap as Capability]
      : []

    return { userId, username, email, role, capabilities }
  } catch {
    return null
  }
}

// ─── Context + Provider ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const cookieToken = getCookie('access_token') ?? null

  const [accessToken, setAccessToken] = useState<string | null>(cookieToken)
  const [user, setUser] = useState<AuthUser | null>(() => parseUserFromToken(cookieToken))

  const loginUser = async (fields: LoginFields) => {
    const res = await login(fields)
    setCookie('access_token', res.token, {
      expires: 1,       // 1 day
      sameSite: 'Lax',
      secure: false,    // set true in production (HTTPS)
      path: '/',
    })
    setAccessToken(res.token)
    setUser(parseUserFromToken(res.token))
  }

  const logoutUser = () => {
    deleteCookie('access_token')
    setAccessToken(null)
    setUser(null)
  }

  // Token expiry check on mount
  useEffect(() => {
    if (!accessToken) return

    try {
      const payload = jwtDecode<JwtPayload>(accessToken)
      const exp = payload.exp
      if (exp && Date.now() / 1000 > exp) {
        setTimeout(() => logoutUser(), 0)
      }
    } catch {
      setTimeout(() => logoutUser(), 0)
    }
  }, [])

  // Global 401 listener
  useEffect(() => {
    function handleUnauthorized() {
      logoutUser()
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const hasCapability = (cap: Capability): boolean => {
    if (!user) return false
    // ADMIN has access to everything
    if (user.role === 'ADMIN') return true
    return user.capabilities.includes(cap)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        accessToken,
        user,
        loginUser,
        logoutUser,
        hasCapability,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
