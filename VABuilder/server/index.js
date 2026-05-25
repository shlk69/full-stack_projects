import express from 'express'
import dotenv from 'dotenv'
import {connection} from './config/connectDB.js'

dotenv.config({
    path:'./.env'
})
const app = express()
const PORT =  process.env.PORT || 3000

app.get('/', (req, res) => {
    res.json('VABuilder is here buddy!')
})

app.listen(PORT,() => {
    console.log("server is running on ", PORT)
    connection()
})