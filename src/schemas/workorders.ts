import { z } from 'zod'

export const workOrderSchema = z.object({
    producedItemId: z
        .number({ error: 'Item is required' })
        .min(1, { error: 'Item is required' }),
    quantity: z
        .number({ error: 'Quantity is required' })
        .int({ error: 'Quantity must be a whole number' })
        .min(1, { error: 'Quantity must be greater than 0' }),
    plannedStartDate: z
        .string()
        .min(1, { error: 'Planned start date is required' }),
    plannedEndDate: z
        .string()
        .min(1, { error: 'Planned end date is required' }),
    notes: z
        .string()
        .max(500, { error: 'Notes must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
})
    .refine(
        data => new Date(data.plannedEndDate) >= new Date(data.plannedStartDate),
        {
            error: 'End date must be after start date',
            path: ['plannedEndDate'],
        },
    )

export type WorkOrderFormFields = z.infer<typeof workOrderSchema>

