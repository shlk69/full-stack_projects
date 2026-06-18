import morgan from 'morgan'
import express from 'express'
import connect from './db/db.js'
import userRoutes from './routes/user.routes.js'
export const app = express()

connect()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/users',userRoutes)

app.get('/', (req, res) => {
    res.send('Hey there , ai dev is here')
})