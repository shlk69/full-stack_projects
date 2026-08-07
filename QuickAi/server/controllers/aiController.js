import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/express';
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';

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
        console.error("generateArticle error:", error.message);
        const is429 = error.message?.includes('429') || error.status === 429;
        return res.status(500).json({ success: false, message: is429 ? 'AI rate limit reached. Please wait a moment and try again.' : error.message || 'Internal server error.' });
    }
};

export const generateBlogTitle = async (req, res) => {
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
            max_completion_tokens: 100
        });

        const content = response.choices[0].message.content;

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, ${prompt}, ${content}, 'blog-title')`;

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
        console.error("generateBlogTitle error:", error.message);
        const is429 = error.message?.includes('429') || error.status === 429;
        return res.status(500).json({ success: false, message: is429 ? 'AI rate limit reached. Please wait a moment and try again.' : error.message || 'Internal server error.' });
    }
}





export const generateImage = async (req, res) => {
    try {
        const { prompt, publish } = req.body;
        const plan = req.plan;

        // Extract userId (Assuming it comes from Clerk middleware via req.auth)
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }

        // 403 Forbidden: Premium users only
        if (plan !== 'premium' ) {
            return res.status(403).json({ success: false, message: 'This feature is available for only Premium users.' });
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


        return res.status(200).json({ success: true, content:secure_url });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
}


export const removeBackground = async (req, res) => {
    try {
        const image = req.file
        const plan = req.plan;

        // Extract userId (Assuming it comes from Clerk middleware via req.auth)
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }

        // 403 Forbidden: Premium users only
        if (plan !== 'premium' ) {
            return res.status(403).json({ success: false, message: 'This feature is available for only Premium users.' });
        }


        

        const imageBuffer = fs.readFileSync(image.path);
        const formData = new FormData();
        formData.append('image_file', new Blob([imageBuffer]), image.originalname || 'image.png');

        const { data } = await axios.post('https://clipdrop-api.co/remove-background/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            responseType: 'arraybuffer'
        });

        const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image);



        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;


        return res.status(200).json({ success: true, content:secure_url });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
}


export const removeImageObject = async (req, res) => {
    try {
        const  image  = req.file
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

export const resumeReview = async (req, res) => {
    try {
        const  resume  = req.file
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


        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." })
        }

         

        const dataBuffer = fs.readFileSync(resume.path);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        
        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses and area for improvement. Resume Content:\n\n${pdfData.text}`;


        const response = await openai.chat.completions.create({
            model: "gemini-3.6-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: 2500
        });

        const content = response.choices[0].message.content

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;


        return res.status(200).json({ success: true, content});

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
}