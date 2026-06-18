import mongoose from "mongoose";
import 'dotenv/config'

function connect() {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
        console.log('db connected')
        }).catch((err) => {
        console.log('error while connecting to db :',err.message)
    })
}

export default connect