import { drizzle } from 'drizzle-orm'


export const db = drizzle(process.env.DATABASE_URL!);