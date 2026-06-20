import { z } from 'zod'

export const routingStepSchema = z.object({
    sequence: z
        .number({ error: 'Sequence is required' })
        .min(1, { error: 'Sequence must be greater than 0' }),
    operationName: z
        .string()
        .min(2, { error: 'Operation name must be at least 2 characters' })
        .max(100, { error: 'Operation name must not exceed 100 characters' }),
    estimatedMinutes: z
        .number({ error: 'Estimated minutes is required' })
        .min(1, { error: 'Estimated minutes must be greater than 0' }),
    workstationId: z
        .number({ error: 'Workstation is required' })
        .min(1, { error: 'Workstation is required' }),
    machineId: z.number().optional(),
    notes: z
        .string()
        .max(500, { error: 'Notes must not exceed 500 characters' })
        .optional()
        .or(z.literal('')),
})

export type RoutingStepFormFields = z.infer<typeof routingStepSchema>

