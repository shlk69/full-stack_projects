import 'dotenv/config'
import express from 'express'
import { connectDb } from './config/db.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import userRouter from './routes/user.routes.js'

const app = express()

const port = process.env.PORT || 3000
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use('/api/auth', authRouter)
app.use('/api/user',userRouter)

app.get('/', (req, res) => {
    res.send('Hey there app is live')
})


app.listen(port,() => {
    connectDb
    console.log('Server is running on port ',port)
})

