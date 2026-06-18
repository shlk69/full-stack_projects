import {app} from './app.js'
import  'dotenv/config'
import http from 'http'

const server = http.createServer(app)
const port = process.env.PORT || 5000

server.listen(port, () => {
    console.log(`server is running on port ${port}`)
})