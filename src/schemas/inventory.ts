import { z } from 'zod'

export const inventoryTransactionSchema = z.object({
    quantity: z
        .number({ error: 'Quantity is required' })
        .refine(v => v !== 0, { error: 'Quantity cannot be zero' }),
    transactionType: z.enum(['Purchase', 'Adjustment'], {
        error: 'Transaction type is required',
    }),
    notes: z
        .string()
        .max(500, { error: 'Notes must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
})
    .refine(
        data => data.transactionType !== 'Purchase' || data.quantity > 0,
        {
            error: 'Purchase quantity must be positive',
            path: ['quantity'],
        },
    )

export type InventoryTransactionFormFields = z.infer<typeof inventoryTransactionSchema>

