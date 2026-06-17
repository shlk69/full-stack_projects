import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'



import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import chatRoutes from './routes/chat.routes.js'
import { connectDB } from './config/db.js'

dotenv.config()
const PORT = process.env.PORT || 3000
const app = express()


app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())


app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chat', chatRoutes)


app.listen(PORT, () => {
    console.log('Server is runnong on port no. ', PORT)
    connectDB()
})
