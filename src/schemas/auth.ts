import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, { error: 'Username is required' }),
  password: z.string().min(1, { error: 'Password is required' }),
})

export type LoginFields = z.infer<typeof loginSchema>

// Backend returns { token: string } — just the token
export type LoginResponse = {
  token: string
}
