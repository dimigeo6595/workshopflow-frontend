import { z } from 'zod'

export const workstationSchema = z.object({
    code: z
        .string()
        .min(2, { error: 'Code must be at least 2 characters' })
        .max(50, { error: 'Code must not exceed 50 characters' }),
    name: z
        .string()
        .min(2, { error: 'Name must be at least 2 characters' })
        .max(100, { error: 'Name must not exceed 100 characters' }),
    notes: z
        .string()
        .max(500, { error: 'Notes must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
})

export type WorkstationFormFields = z.infer<typeof workstationSchema>

export const machineSchema = z.object({
    code: z
        .string()
        .min(2, { error: 'Code must be at least 2 characters' })
        .max(50, { error: 'Code must not exceed 50 characters' }),
    name: z
        .string()
        .min(2, { error: 'Name must be at least 2 characters' })
        .max(100, { error: 'Name must not exceed 100 characters' }),
    notes: z
        .string()
        .max(500, { error: 'Notes must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
})

export type MachineFormFields = z.infer<typeof machineSchema>

