import 'dotenv/config'
import express from 'express'
import { connectDb } from './config/db.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

const port = process.env.PORT || 3000
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use('/api/auth',authRouter)

app.get('/', (req, res) => {
    res.send('Hey there app is live')
})


app.listen(() => {
    connectDb
    console.log('Server is running on port ',port)
})

