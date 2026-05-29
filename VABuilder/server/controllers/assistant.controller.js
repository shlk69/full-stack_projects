import { User } from "../models/user.model.js"

export const getAssistantConfig = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findById(userId).select('-geminiApiKey')
        if (!user) {
            return res.status(404).json({
                message:'User not found'
            })
        }
        
        return res.status(200).json({
            message: 'Assistant configuration complete',
            user
        })

    } catch (error) {
        console.log('Assistant config error :', error.message)
        return res.status(500).json({
            message:'Error while configuring assistant'
        })
    }
}