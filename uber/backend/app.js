const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.get('/', (req, res) => {
    res.send('Hello , uber is here to pick u up!')
})


module.exports = app