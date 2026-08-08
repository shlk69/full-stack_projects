import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/express';
import FormData from 'form-data';
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

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
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};





const uploadImageToCloudinary = async (imageBuffer) => {
    const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

    try {
        return await cloudinary.uploader.upload(base64Image, {
            folder: "ai-images",
        });
    } catch (cloudinaryError) {
        console.warn("Cloudinary upload failed, returning inline image data instead.", cloudinaryError.message);
        return {
            secure_url: base64Image,
        };
    }
};

const generateImageWithClipdrop = async (prompt) => {
    const formData = new FormData();
    formData.append("prompt", prompt);

    const response = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
        headers: {
            "x-api-key": process.env.CLIPDROP_API_KEY,
            ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
    });

    if (response.status !== 200) {
        throw new Error(`Clipdrop request failed with status ${response.status}`);
    }

    return response.data;
};

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

        let uploadResult;

        try {
            const response = await openai.images.generate({
                model: "gemini-2.5-flash-image",
                prompt,
                n: 1,
                response_format: "b64_json",
            });

            if (!response.data || response.data.length === 0 || !response.data[0]?.b64_json) {
                throw new Error("No image returned by Gemini.");
            }

            const imageBuffer = Buffer.from(response.data[0].b64_json, "base64");
            uploadResult = await uploadImageToCloudinary(imageBuffer);
        } catch (geminiError) {
            console.warn("Gemini image generation failed, trying Clipdrop fallback.", geminiError.message);

            if (!process.env.CLIPDROP_API_KEY) {
                throw new Error("Gemini image generation failed and no Clipdrop API key is configured.");
            }

            const clipdropBuffer = await generateImageWithClipdrop(prompt);
            uploadResult = await uploadImageToCloudinary(Buffer.from(clipdropBuffer));
        }

        await sql`
      INSERT INTO creations
      (user_id, prompt, content, type, publish)
      VALUES
      (
        ${userId},
        ${prompt},
        ${uploadResult.secure_url},
        'image',
        ${publish ?? false}
      )
    `;

        return res.status(200).json({
            success: true,
            content: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("========= IMAGE GENERATION ERROR =========");

        if (error.response) {
            console.error(error.response.data);
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
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

        const uploadResult = await cloudinary.uploader.upload(image.path, {
            folder: 'ai-images',
            background_removal: 'cloudinary_ai',
            format: 'png',
        });

        const secure_url = uploadResult.secure_url || uploadResult.url;

        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;

        return res.status(200).json({ success: true, content: secure_url });
    } catch (error) {
        console.error('Remove background error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
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




        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [
                {
                    effect: `gen_remove:${object}`
                }
            ],
            resource_type: 'image'
        })



        // Save to Database
        await sql`insert into creations (user_id,prompt,content,type) values(${userId}, ${`Remove ${object} from the image`}, ${imageUrl}, 'image')`;


        return res.status(200).json({ success: true, content: imageUrl });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

const buildFallbackResumeReview = (resumeText) => {
    const text = resumeText.replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();

    const hasSummary = /summary|profile|objective/i.test(lower);
    const hasExperience = /experience|employment|work|developer|engineer|manager|intern/i.test(lower);
    const hasSkills = /skills|technologies|tools|languages|frameworks/i.test(lower);
    const hasEducation = /education|university|college|degree|school|certification/i.test(lower);
    const hasProjects = /project|projects|portfolio|achievement/i.test(lower);

    const bullets = [
        hasSummary
            ? 'Your summary or profile is clear and helps frame your background quickly.'
            : 'Add a concise professional summary at the top so recruiters can understand your value immediately.',
        hasExperience
            ? 'Your experience section is a strong foundation; make sure each role highlights specific results.'
            : 'Include recent work experience with responsibilities, achievements, and measurable outcomes.',
        hasSkills
            ? 'Your skills section is useful, and it can be made even more scannable by grouping related tools together.'
            : 'List your technical and soft skills in a clear, grouped format to improve readability.',
        hasEducation
            ? 'Your education and training details are already present and should remain concise.'
            : 'Add your academic background and any relevant certifications to strengthen credibility.',
        hasProjects
            ? 'Projects or achievements help demonstrate practical impact and are a strong addition.'
            : 'Highlight projects, internships, or notable accomplishments to make the resume more compelling.'
    ];

    return `## Resume Review

Here is a practical review based on the content detected in the uploaded resume:

- ${bullets[0]}
- ${bullets[1]}
- ${bullets[2]}
- ${bullets[3]}
- ${bullets[4]}

### Suggested improvements
1. Tailor the resume to the target role by matching keywords from the job description.
2. Quantify achievements with measurable results such as revenue, efficiency, or team impact.
3. Keep formatting consistent and avoid dense blocks of text.
4. Prioritize the most relevant experience and move older details lower.

### Overall impression
The resume has a solid foundation. With clearer positioning, stronger quantified results, and tighter formatting, it will be much more compelling to recruiters and hiring managers.`;
};

const generateResumeReview = async (resumeText) => {
    if (!process.env.GEMINI_API_KEY) {
        return buildFallbackResumeReview(resumeText);
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gemini-3.6-flash',
            messages: [{ role: 'user', content: `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Keep the feedback practical and professional. Resume Content:\n\n${resumeText}` }],
            temperature: 0.7,
            max_completion_tokens: 1800,
        });

        return response.choices?.[0]?.message?.content || buildFallbackResumeReview(resumeText);
    } catch (error) {
        console.warn('Gemini resume review failed, using fallback review.', error.message);
        return buildFallbackResumeReview(resumeText);
    }
};

export const resumeReview = async (req, res) => {
    try {
        const resume = req.file;
        const plan = req.plan;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }

        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: 'This feature is available for only Premium users.' });
        }

        if (!resume) {
            return res.status(400).json({ success: false, message: 'Please upload a resume file.' });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.status(413).json({ success: false, message: 'Resume file size exceeds allowed size (5MB).' });
        }

        if (resume.mimetype && !resume.mimetype.includes('pdf')) {
            return res.status(400).json({ success: false, message: 'Only PDF resumes are supported.' });
        }

        let pdfText = '';

        try {
            const dataBuffer = fs.readFileSync(resume.path);
            const pdfData = await pdfParse(dataBuffer);
            pdfText = pdfData?.text?.trim() || '';
        } catch (parseError) {
            console.warn('Resume PDF parsing failed:', parseError.message);
            pdfText = '';
        }

        if (!pdfText) {
            return res.status(400).json({ success: false, message: 'The uploaded file does not contain readable resume text.' });
        }

        const content = await generateResumeReview(pdfText);

        try {
            await sql`insert into creations (user_id,prompt,content,type) values(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;
        } catch (dbError) {
            console.warn('Resume review creation save failed:', dbError.message);
        }

        return res.status(200).json({ success: true, content });
    } catch (error) {
        console.error('Resume review error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
    }
}