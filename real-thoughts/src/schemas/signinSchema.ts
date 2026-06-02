import { z } from 'zod'

export const signInValidation = z.object({
    identifier: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1,'Password is required')
})