import { generateGeminiResponse } from "../config/gemini.js"
import { User } from "../models/user.model.js"
import { catchAsync } from '../utils/catchAsync.js'
import { successResponse, errorResponse } from '../utils/ApiResponse.js'
import logger from '../utils/logger.js'

export const getAssistantConfig = catchAsync(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId).select('-geminiApiKey')

    if (!user) {
        return errorResponse(res, 'User not found', null, 404)
    }

    return successResponse(res, user, 'Assistant configuration fetched', 200)
})

export const askAssistant = catchAsync(async (req, res) => {
    const { message, userId } = req.body

    if (!message || !userId) {
        return errorResponse(res, 'Message and UserId are required', null, 400)
    }

    const user = await User.findById(userId)

    if (!user) {
        return errorResponse(res, 'User not found', null, 404)
    }

    if (!user.geminiApiKey) {
        return errorResponse(res, 'Gemini API key is not configured', null, 404)
    }

    if (user.plan === "free" && user.totalMessages >= user.requestLimit) {
        return errorResponse(res, 'Free tier message limit reached', null, 400)
    }

    if (user.plan === "pro" && new Date(user.proExpiresAt) < new Date()) {
        user.plan = "free"
        await user.save()
        return errorResponse(res, 'Pro plan has expired. Plan downgraded to free.', null, 400)
    }

    const cleanMessage = message.toLowerCase()

    // Navigation Logic
    if (user.enableNavigation) {
        const navigationWords = ["open", "go", "start", "show", "navigate", "take me"]
        const wantsNavigation = navigationWords.some((word) => cleanMessage.startsWith(word))

        if (wantsNavigation) {
            const matchedPage = user.pages.find((page) =>
                page.keywords.some((keyword) => cleanMessage.includes(keyword.toLowerCase()))
            )

            if (matchedPage) {
                if (req.body.currentPath === matchedPage.path) {
                    return successResponse(res, {
                        response: `${matchedPage.name} already open`
                    }, 'Page already open', 200)
                }
                return successResponse(res, {
                    action: "navigate",
                    path: matchedPage.path,
                    response: `Opening ${matchedPage.name}`
                }, 'Navigation request', 200)
            }

            if (!matchedPage) {
                return errorResponse(res, "Couldn't find that page", null, 404)
            }
        }
    }

    // Generate AI Response
    const prompt = `
You are ${user.assistantName}.

Business Name: ${user.buisnessName}
Business Type: ${user.buisnessType}
Business Description: ${user.buisnessDescription}
Assistant Tone: ${user.tone}

Rules:
- Keep replies clear , concise and on point 
- Give fast direct responses
- Talk naturally
- Behave like a smart voice assistant
- Avoid long explanations
- Keep responses short for quick voice playback

User Question: ${message}
`

    const aiResponse = await generateGeminiResponse({
        prompt,
        apikey: user.geminiApiKey,
        user
    })

    if (user.plan === "free") {
        user.totalMessages += 1
        await user.save()
        logger.info(`Free user message count: ${user.totalMessages}`)
    }

    return successResponse(res, { aiResponse }, 'Assistant response generated', 200)
})
