import { z } from 'zod'

export const itemSchema = z.object({
    itemCode: z
        .string()
        .min(2, { error: 'Item code must be at least 2 characters' })
        .max(50, { error: 'Item code must not exceed 50 characters' }),
    name: z
        .string()
        .min(2, { error: 'Name must be at least 2 characters' })
        .max(100, { error: 'Name must not exceed 100 characters' }),
    description: z
        .string()
        .max(500, { error: 'Description must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
    itemType: z.enum(['RawMaterial', 'SemiFinished', 'FinalProduct', 'Consumable'], {
        error: 'Item type is required',
    }),
    weightPerUoM: z
        .number()
        .min(0, { error: 'Weight per UoM must be a positive number' })
        .optional(),
    unitOfMeasureId: z
        .number({ error: 'Unit of measure is required' })
        .min(1, { error: 'Unit of measure is required' }),
    weightUoMId: z.number().optional(),
})

export type ItemFormFields = z.infer<typeof itemSchema>
