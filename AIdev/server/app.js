import morgan from 'morgan'
import express from 'express'
import connect from './db/db.js'
import userRoutes from './routes/user.routes.js'
import projectRoutes from './routes/project.routes.js'
import cookieParser from 'cookie-parser'

import cors from 'cors'
export const app = express()

connect()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use('/users', userRoutes)
app.use('/projects', userRoutes)

app.get('/', (req, res) => {
    res.send('Hey there , ai dev is here')
})
