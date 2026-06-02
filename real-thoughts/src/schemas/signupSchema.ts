import { z } from 'zod'

export const usernameValidation = z
    .string()
    .min(4,'Username must be atleast 4 characters long')
    .max(20, 'Username must not be more than 20 characters')
    
export const signupValidation = z.object({
    username: usernameValidation,
    email: z.email({ message: 'Invalid email' }),
    password:z.string().min(6,{message:'Password must be 6 characters long'})
})