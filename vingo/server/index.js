import 'dotenv/config'
import express from 'express'
import { connectDb } from './config/db.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import userRouter from './routes/user.routes.js'
import shopRouter from './routes/shop.routes.js'
import itemRouter from './routes/items.routes.js'
import orderRouter from './routes/order.routes.js'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)


const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    },
    method: ['POST','GET']
})

app.set('io',io)



const port = process.env.PORT || 3000
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use('/api/auth', authRouter)
app.use('/api/user',userRouter)
app.use('/api/shop',shopRouter)
app.use('/api/item',itemRouter)
app.use('/api/order',orderRouter)

app.get('/', (req, res) => {
    res.send('Hey there app is live')
})


server.listen(port,() => {
    connectDb
    console.log('Server is running on port ',port)
})

