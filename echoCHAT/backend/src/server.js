import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'


import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import chatRoutes from './routes/chat.routes.js'
import { connectDB } from './config/db.js'

dotenv.config()
const PORT = process.env.PORT || 300
const app = express()


app.use(express.json({
    limit:'16kb'
}))
app.use(cookieParser())


app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chat', chatRoutes)


app.listen(PORT, () => {
    console.log('Server is runnong on port no. ', PORT)
    connectDB()
})
