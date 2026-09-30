const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const userRoutes = require('./routes/user.routes')
const cookieParser = require('cookie-parser')



const app = express()
const cors = require('cors')
const connectToDb = require('./db/db')

connectToDb()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Hello , uber is here to pick u up!')
})
app.use('/users',userRoutes)


module.exports = app