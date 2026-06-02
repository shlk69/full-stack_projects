import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?:number
}

const connection: ConnectionObject = {}

export async function connectDb():Promise<void> {
    if (connection.isConnected) {
        console.log('Database already connceted')
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '')
        connection.isConnected = db.connections[0].readyState
        console.log('DB connected successfully')
    } catch (error : any) {
        console.log('Error while connecting ',error.message)
        process.exit()
    }
}
