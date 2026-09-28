import type { messageResponseSchema } from '@/schemas'
import z from 'zod'

export type MessageResponse = z.infer<typeof messageResponseSchema>
