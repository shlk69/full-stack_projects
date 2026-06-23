import { User } from "../models/user.model.js"
import { catchAsync } from '../utils/catchAsync.js'
import { successResponse, errorResponse } from '../utils/ApiResponse.js'
import logger from '../utils/logger.js'

export const getCurrentUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.userId)
    if (!user) {
        return errorResponse(res, 'User not found', null, 404)
    }
    return successResponse(res, user, 'Current user fetched', 200)
})

export const saveAssistant = catchAsync(async (req, res) => {
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
        return errorResponse(res, 'User not found', null, 404)
    }

    user.assistantName = assistantName
    user.buisnessName = buisnessName
    user.buisnessType = buisnessType
    user.buisnessDescription = buisnessDescription
    user.tone = tone
    user.theme = theme

    if (geminiApiKey) {
        user.geminiApiKey = geminiApiKey
        user.geminiStatus = 'active'
    }

    user.pages = pages || []
    user.isSetupComplete = true

    await user.save()
    logger.info(`Assistant saved for user: ${user._id}`)

    return successResponse(res, user, 'Assistant saved successfully', 200)
})
