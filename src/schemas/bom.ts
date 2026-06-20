import { z } from 'zod'

export const bomLineSchema = z.object({
    componentItemId: z
        .number({ error: 'Component item is required' })
        .min(1, { error: 'Component item is required' }),
    quantity: z
        .number({ error: 'Quantity is required' })
        .min(0.0001, { error: 'Quantity must be greater than 0' }),
    unitOfMeasureId: z
        .number({ error: 'Unit of measure is required' })
        .min(1, { error: 'Unit of measure is required' }),
    notes: z
        .string()
        .max(500, { error: 'Notes must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
})

export type BomLineFormFields = z.infer<typeof bomLineSchema>

