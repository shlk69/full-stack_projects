import { generateGeminiResponse } from "../config/gemini.js"
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


export const askAssistant = async (req, res) => {
    try {
        const { message, userId } = req.body

        if (!message || !userId) {
            return res.status(400).json({ message: "Message and UserId are required" })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (!user.geminiApiKey) {
            return res.status(404).json({ message: "gemini api key is not added" })
        }

        if (user.plan === "free"
            && user.totalMessages >= user.requestLimit) {
            return res.status(400).json({ message: "Free limit reached" })
        }

        if (user.plan === "pro" && new Date(user.proExpiresAt) < new Date()) {
            user.plan = "free"

            await user.save()

            return res.status(400).json({ message: "Pro plan expired" })
        }

        const cleanMessage = message.toLowerCase()

        if (user.enableNavigation) {

            const navigationWords = [
                "open",
                "go",
                "start",
                "show",
                "navigate",
                "take me",
            ];

            // Check navigation intent
            const wantsNavigation =
                navigationWords.some((word) =>

                    cleanMessage.startsWith(word)
                );

            if (wantsNavigation) {

                const matchedPage =
                    user.pages.find((page) =>

                        page.keywords.some((keyword) =>

                            cleanMessage.includes(
                                keyword.toLowerCase()
                            )
                        )
                    )
                
                if (matchedPage) {
                    if (
                        req.body.currentPath ===
                        matchedPage.path
                    ) {

                        return res.json({

                            success: true,

                            response:
                                `${matchedPage.name} already open`

                        });
                    }
                }
                if (!matchedPage) {
                    return res.status(404).json({
                        success: false,
                        response: "Sorry, I couldn't find that page."
                    });
                }

                return res.json({

                    success: true,

                    action: "navigate",

                    path: matchedPage.path,

                    response:
                        `Opening ${matchedPage.name}`,

                });
            }

        }


        const prompt = `

You are ${user.assistantName}.

Buisness Name:
${user.buisnessName}

Buisness Type:
${user.buisnessType}

bBisness Description:
${user.buisnessDescription}

Assistant Tone:
${user.tone}
'

 Rules:

- Keep replies under 15 words
- Give fast direct responses
- Talk naturally
- Behave like smart voice assistant
- Avoid long explanations
- Keep responses short for quick voice playback

User Question:
${message}

`

    const aiResponse = await generateGeminiResponse({prompt, apikey:user.geminiApiKey, user} )
        
        if (user.plan === "free") {
            user.totalMessages += 1

            await user.save()

        }
        return res.json({
            success: true,
            aiResponse
        });

    } catch (error) {
        console.log(error.message)

        return res.status(500).json({
            success: false,
            message:
                "Assistant AI Error : "+error.message,
        })
    }
}
