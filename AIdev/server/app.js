import morgan from 'morgan'
import express from 'express'
import connect from './db/db.js'
export const app = express()

connect()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.send('Hey there , ai dev is here')
})