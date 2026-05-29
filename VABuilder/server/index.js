import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connection } from './config/connectDB.js'
import authRoutes from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import assistantRouter from './routes/assistant.route.js'

const app = express()

const privateCors =
    cors({

        origin: [
            "http://localhost:5173"
        ],

        credentials: true

    });

const publicCors =
    cors({
        origin: "*",
    });


app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.json('VABuilder is here buddy!')
})

app.use('/api/auth',privateCors, authRoutes)
app.use('/api/user',privateCors, userRouter)
app.use('/api/assistant',publicCors, assistantRouter)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT)
    connection()
})
