import { StreamChat } from 'stream-chat'
import 'dotenv/config' 

const apikey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if (!apiSecret || !apikey) {
    console.error('ENV vars undefined')
}

const streamClient = StreamChat.getInstance(apikey, apiSecret)

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData)
        return userData
    } catch (error) {
        console.error(error)
        throw error
    }
}


export const generateStreamToken = async (userId) => {
    try {
        const userIdStr = userId.toString()
        return  streamClient.createToken(userIdStr)
    } catch (error) {
        console.log('Error while creating stream token :', error.message)
        throw error
    }
}