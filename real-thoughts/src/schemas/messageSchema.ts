import { z } from "zod";

export const messageValidation = z.object({
    message: z
        .string()
        .min(10, "Content must be atleast 10 characters long")
        .max(300, 'Content must not be more than 300 characters long'),
});

