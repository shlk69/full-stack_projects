import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const PORT = process.env.PORT || 300
const app = express()

app.listen(PORT, () => {
    console.log('Server is runnong on port no. ' ,PORT)
})
