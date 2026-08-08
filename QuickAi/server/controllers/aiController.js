import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/express';
import FormData from 'form-data';
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { topic, length } = req.body;

        const plan = req.plan;
        const free_usage = req.free_usage;

        const userId = req.auth?.userId;

        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized access." });
        }

        if (plan !== "premium" && free_usage >= 10) {
            return res.status(403).json({
                success: false,
                message: "Limit reached. Upgrade to continue.",
            });
        }

        const tokenLimit =
            length === 800
                ? 1800
                : length === 1200
                    ? 2800
                    : 3800;

        const prompt = `
You are an elite SEO content writer and editor.

Write a COMPLETE, HIGH-QUALITY, HUMAN-LIKE blog article on the topic below.

Topic:
"${topic}"

Goal:
Create content that is detailed, useful, engaging, and rich with relevant keywords naturally woven into the article.

Requirements:
- Write a minimum of ${length} words.
- Return ONLY Markdown.
- Start with one strong SEO title.
- Write an engaging introduction that clearly defines the topic.
- Include at least 7 detailed H2 headings.
- Use H3 subheadings where useful.
- Each section must contain multiple substantial paragraphs.
- Include actionable tips, examples, and practical advice.
- Add bullet points where they improve readability.
- Add a FAQ section with 4-6 useful questions and answers.
- End with a strong conclusion that summarizes the main takeaways.
- Make the article sound natural, insightful, and valuable to a real reader.
- Use the main topic keywords repeatedly in a natural way, but do not stuff keywords unnaturally.
- Avoid generic filler and avoid weak summaries.
- Do not stop early. Finish the full article.

Writing style:
- Professional but conversational.
- Clear, informative, and persuasive.
- Structured for readability and SEO.
- Use strong transitions between sections.
`;

        const response = await openai.chat.completions.create({
            model: "gemini-3.6-flash",
            temperature: 0.7,
            max_completion_tokens: tokenLimit,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const content = response.choices[0].message.content;

        await sql`
      INSERT INTO creations
      (user_id,prompt,content,type)
      VALUES
      (${userId},${topic},${content},'article')
    `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1,
                },
            });
        }

        res.json({
            success: true,
            content,
        });
    } catch (error) {
        console.error("generateArticle error:", error.message);
        const is429 = error.message?.includes('429') || error.status === 429;
        return res.status(500).json({ success: false, message: is429 ? 'AI rate limit reached. Please wait a moment and try again.' : error.message || 'Internal server error.' });
    }
};

export const generateBlogTitle = async (req, res) => {
    try {
        const { keyword, category } = req.body;

        const plan = req.plan;
        const free_usage = req.free_usage;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access.",
            });
        }

        if (plan !== "premium" && free_usage >= 10) {
            return res.status(403).json({
                success: false,
                message: "Limit reached. Upgrade to continue.",
            });
        }

        const prompt = `
You are an expert SEO blog title generator.

Generate EXACTLY 15 unique blog titles.

Keyword:
${keyword}

Category:
${category}

Rules:

- Return ONLY a numbered list.
- Generate exactly 15 titles.
- Each title should be on a new line.
- Do not use Markdown.
- Do not use bold (**).
- Do not explain anything.
- Do not include character counts.
- Do not stop before generating all 15 titles.

Example:

1. React Hooks Every Developer Should Know
2. 15 React Best Practices for 2026
3. React Performance Optimization Guide
4. Why React Still Dominates Frontend Development
5. React vs Vue Comparison
...
15. Advanced React Patterns
`;

        const response = await openai.chat.completions.create({
            model: "gemini-3.6-flash",
            temperature: 0.9,
            max_completion_tokens: 1500,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const choice = response.choices[0];
        const content = choice.message.content;

        if (choice.finish_reason === "length") {
            console.warn("Blog title generation was truncated — consider raising max_completion_tokens");
        }
        await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${keyword}, ${content}, 'blog-title')
    `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1,
                },
            });
        }

        return res.json({
            success: true,
            content,
        });
    } catch (error) {
        console.error("generateBlogTitle error:", error.message);
        const is429 = error.message?.includes('429') || error.status === 429;
        return res.status(500).json({ success: false, message: is429 ? 'AI rate limit reached. Please wait a moment and try again.' : error.message || 'Internal server error.' });
    }
}





export const generateImage = async (req, res) => {
    try {
        const { prompt, publish } = req.body;

        const plan = req.plan;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access.",
            });
        }

        if (plan !== "premium") {
            return res.status(403).json({
                success: false,
                message: "This feature is available only for Premium users.",
            });
        }

        let enhancedPrompt = prompt;
        try {
            const response = await openai.chat.completions.create({
                model: "gemini-3.6-flash",
                messages: [
                    {
                        role: "system",
                        content: "You are an image prompt enhancer. Your ONLY job is to take the user's image description and make it more detailed and vivid for an AI image generator. STRICTLY preserve the original subject, style, and intent. DO NOT change the subject. DO NOT add unrelated elements. Return ONLY the enhanced prompt text, nothing else. Keep it under 250 characters."
                    },
                    {
                        role: "user",
                        content: `Enhance this image prompt while keeping the same subject and style: "${prompt}"`,
                    },
                ],
                temperature: 0.4,
                max_completion_tokens: 150
            });
            enhancedPrompt = response.choices[0]?.message?.content?.trim() || prompt;
            console.log("Original prompt:", prompt);
            console.log("Enhanced prompt:", enhancedPrompt);
        } catch (geminiError) {
            console.log("Gemini API call failed, using raw prompt:", geminiError.message);
        }

        let imageSource;
        try {
            const formData = new FormData();
            formData.append('prompt', enhancedPrompt);
            const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                },
                responseType: 'arraybuffer'
            });
            imageSource = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;
            console.log("Clipdrop image generated successfully");
        } catch (clipdropError) {
            console.log("Clipdrop failed:", clipdropError.message, "— using Pollinations AI");
            // Upload the Pollinations URL directly to Cloudinary (no base64 needed)
            imageSource = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
            console.log("Using Pollinations URL:", imageSource);
        }

        const { secure_url } = await cloudinary.uploader.upload(imageSource, {
            resource_type: 'image',
            folder: 'quickai'
        });

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type,publish) values(${userId}, ${prompt}, ${secure_url}, 'image',${publish ?? false})`;


        return res.status(200).json({
            success: true,
            content: secure_url,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
};


export const removeBackground = async (req, res) => {
    try {
        const image = req.file;
        const plan = req.plan;

        if (!image) {
            return res.status(400).json({ success: false, message: 'Please upload an image file.' });
        }

        // Extract userId (Assuming it comes from Clerk middleware via req.auth)
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }

        // 403 Forbidden: Premium users only
        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: 'This feature is available for only Premium users.' });
        }




        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(image.path), {
            filename: image.originalname || 'image.png',
            contentType: image.mimetype || 'image/png',
        });

        const { data } = await axios.post('https://clipdrop-api.co/remove-background/v1', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            responseType: 'arraybuffer'
        });

        const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image);



        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;

        return res.status(200).json({ success: true, content: secure_url });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
}


export const removeImageObject = async (req, res) => {
    try {
        const image = req.file
        const { object } = req.body
        const plan = req.plan;

        // Extract userId (Assuming it comes from Clerk middleware via req.auth)
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }

        // 403 Forbidden: Premium users only
        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: 'This feature is available for only Premium users.' });
        }




        const imageBuffer = fs.readFileSync(image.path);
        const imageBlob = new Blob([imageBuffer], { type: image.mimetype || 'image/png' });

        // Use Cloudinary uploader with eager gen_remove transformation
        const uploadResult = await cloudinary.uploader.upload(image.path);

        // Force gen_remove transformation via explicit call
        let imageUrl;
        try {
            const transformResult = await cloudinary.uploader.explicit(uploadResult.public_id, {
                type: 'upload',
                eager: [
                    { effect: `gen_remove:${object}` }
                ],
                eager_async: false
            });
            imageUrl = transformResult.eager?.[0]?.secure_url || uploadResult.secure_url;
            console.log("Object removed via Cloudinary gen_remove:", imageUrl);
        } catch (transformError) {
            console.log("Cloudinary gen_remove failed:", transformError.message);
            return res.status(500).json({
                success: false,
                message: "Object removal requires Cloudinary AI Add-on. Please enable 'Generative Remove' in your Cloudinary dashboard."
            });
        }



        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, ${`Remove ${object} from the image`}, ${imageUrl}, 'image')`;


        return res.status(200).json({ success: true, content: imageUrl });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
}
