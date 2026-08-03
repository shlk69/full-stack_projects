import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/express';
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

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
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
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

        const formData = new FormData()
        formData.append('prompt', prompt)
       const data =  await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,

            },
            responseType:'arraybuffer'
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`
        

        const { secure_url} = await cloudinary.uploader.upload(base64Image)

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type,publish) values(${userId}, ${prompt}, ${secure_url}, 'image',${publish ?? false})`;


        return res.status(200).json({ success: true, content:secure_url });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}


export const removeBackground = async (req, res) => {
    try {
        const {image} = req.file
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


        

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })



        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;


        return res.status(200).json({ success: true, content:secure_url });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}


export const removeImageObject = async (req, res) => {
    try {
        const { image } = req.file
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




        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [
                {
                    effect:`gen_remove:${object}`
                }
            ],
            resource_type:'image'
        })



        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, ${`Remove ${object} from the image`}, ${imageUrl}, 'image')`;


        return res.status(200).json({ success: true, content: imageUrl });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
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

         

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)
        
        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses and area for improvment. Resume Content:\n\n${pdfData.text}`


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

        const content = response.choices[0].message.content

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;


        return res.status(200).json({ success: true, content});

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}