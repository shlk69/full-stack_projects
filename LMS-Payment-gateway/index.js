import dotenv from 'dotenv'
import morgan from 'morgan'
import express from 'express'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cors from 'cors'
dotenv.config({
    path:'./.env'
})

const app = express()
const port = process.env.PORT


//Global rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message:'Too many requests , try after sometime'
})


app.use('/api', limiter)


//Logging middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))


//Body parser middleware
app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())


//Global error hanlders
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {stack:err.stack})
    })
})



//CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', "POST", 'DELETE', 'PUT', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
    ],

}))

//API routes


//404 hanlder(Must be at the bottom)
app.use((req, res) => {
    res.status(404).json({
        status: 'Error',
        message:'Route not found'
    })
})

app.listen(port, () => {
    console.log('Server is running on ',port)
})

