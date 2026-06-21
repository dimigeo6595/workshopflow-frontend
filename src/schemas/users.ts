import { z } from 'zod'

const passwordRegex = /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?\W)^.{8,}$/

export const userSchema = z.object({
    username: z
        .string()
        .min(2, { error: 'Username must be at least 2 characters' })
        .max(50, { error: 'Username must not exceed 50 characters' }),
    email: z
        .string()
        .email({ error: 'Please enter a valid email address' })
        .max(100, { error: 'Email must not exceed 100 characters' }),
    password: z
        .string()
        .regex(passwordRegex, {
            error: 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, digit and special character',
        })
        .optional()
        .or(z.literal('')),
    firstname: z
        .string()
        .min(2, { error: 'First name must be at least 2 characters' })
        .max(50, { error: 'First name must not exceed 50 characters' }),
    lastname: z
        .string()
        .min(2, { error: 'Last name must be at least 2 characters' })
        .max(50, { error: 'Last name must not exceed 50 characters' }),
    roleId: z
        .number({ error: 'Role is required' })
        .min(1, { error: 'Role is required' }),
})

export type UserFormFields = z.infer<typeof userSchema>

