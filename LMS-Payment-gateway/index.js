import dotenv from 'dotenv'
import express from 'express'
dotenv.config({
    path:'./.env'
})

const app = express()
const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is running on ',port)
})

