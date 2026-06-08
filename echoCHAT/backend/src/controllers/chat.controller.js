import { generateStreamToken } from "../config/stream.js"

export const getStreamToken = async (req, res) => {
    try {
        const token = await  generateStreamToken(req.user.id)
        res.status(200).json({token})
    } catch (error) {
        console.log('Error while creating stream token :', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}