import { User } from "../models/user.model.js"
import { catchAsync } from '../utils/catchAsync.js'
import { successResponse, errorResponse } from '../utils/ApiResponse.js'

export const getCurrentUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.userId)
    if (!user) {
        return errorResponse(res, 'User not found', null, 404)
    }
    const safeUser = user.toObject();
    safeUser.hasGeminiApiKey = Boolean(safeUser.geminiApiKey);
    delete safeUser.geminiApiKey;
    return successResponse(res, safeUser, 'Current user fetched', 200)
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

    if (typeof assistantName !== 'string' || !assistantName.trim() || typeof buisnessName !== 'string' || !buisnessName.trim() || typeof buisnessType !== 'string' || !buisnessType.trim()) return errorResponse(res, 'Assistant name, business name and type are required', null, 400);
    if (!Array.isArray(pages || []) || (pages || []).some(page => typeof page.path !== 'string' || !page.path.startsWith('/') || page.path.startsWith('//') || typeof page.name !== 'string' || !Array.isArray(page.keywords))) return errorResponse(res, 'Pages must use relative paths and keyword arrays', null, 400);
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

    const safeUser = user.toObject();
    safeUser.hasGeminiApiKey = Boolean(safeUser.geminiApiKey);
    delete safeUser.geminiApiKey;
    return successResponse(res, safeUser, 'Assistant saved successfully', 200)
})
