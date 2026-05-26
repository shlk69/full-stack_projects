import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connection } from './config/connectDB.js'
import authRoutes from './routes/auth.route.js'

const app = express()

app.use(cors({
    origin: process.env.DOMAIN_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.json('VABuilder is here buddy!')
})

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT)
    connection()
})
