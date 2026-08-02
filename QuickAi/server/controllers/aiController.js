import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/express';

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        // Extract userId (Assuming it comes from Clerk middleware via req.auth)
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }

        // 403 Forbidden: User reached their usage tier limit
        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, message: 'Limit reached. Upgrade to continue.' });
        }

        const response = await openai.chat.completions.create({
            model: "gemini-3.6-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: length
        });

        const content = response.choices[0].message.content;

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, ${prompt}, ${content}, 'article')`;

        // Update Metadata
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        return res.status(200).json({ success: true, content });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
