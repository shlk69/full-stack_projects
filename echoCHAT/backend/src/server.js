import express from 'express'
import dotenv from 'dotenv'


import authRoutes from './routes/auth.routes.js'
import { connectDB } from './config/db.js'

dotenv.config()
const PORT = process.env.PORT || 300
const app = express()


app.use(express.json({
    limit:'16kb'
}))

app.use('/api/auth',authRoutes)
app.listen(PORT, () => {
    console.log('Server is runnong on port no. ', PORT)
    connectDB()
})
