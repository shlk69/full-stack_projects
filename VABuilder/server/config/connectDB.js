import mongoose from "mongoose";

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('DB connected')
    } catch (error) {
        console.log('DB error ',error.message )
    }
}

export {connection}