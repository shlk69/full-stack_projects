import { User } from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({
                message:'User not found'
            })
        }
        return res.status(200).json({
            message: 'Current user',
            user
        })
    } catch (error) {
        console.error("Error fetching current user:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const saveAssistant = async (req, res) => {
    try {
        const {
            assistantName,
            buisnessName,
            buisnessType,
            buisnessDescription,
            tone,
            theme,
            geminiApiKey,
            pages,
        } = req.body

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ message: "Failed to get user" })
        }
        user.assistantName = assistantName;
        user.buisnessName = buisnessName;
        user.buisnessType = buisnessType;
        user.buisnessDescription = buisnessDescription;
        user.tone = tone;
        user.theme = theme;

        if (geminiApiKey) {
            user.geminiApiKey = geminiApiKey
        }

        user.geminiStatus = 'active'
        user.pages = pages || []
        user.isSetupComplete = true
        await user.save()
        return res.status(200).json({
            message: 'Assistant saved successfully',
            user
        })
    } catch (error) {
        console.log('Assistant creation error :',error.message)
        return res.status(500).json({
            message:'Error while creating assistant'
        })
    }
}
