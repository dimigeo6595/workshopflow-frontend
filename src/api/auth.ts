import type { LoginFields, LoginResponse } from '@/schemas/auth'

const API_URL = import.meta.env.VITE_API_URL

export async function login({ username, password }: LoginFields): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    let detail = 'Login failed'
    try {
      const data = await res.json()
      if (typeof data?.message === 'string') detail = data.message
      else if (typeof data?.detail === 'string') detail = data.detail
    } catch {
      // ignore parse error
    }
    throw new Error(detail)
  }

  return await res.json()
}
