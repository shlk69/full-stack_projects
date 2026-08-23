import openai from '../config/openai.js';

const systemPromptTemplate = `You are an elite, world-class content strategist and ghostwriter for high-growth tech executives. 
Your objective is to read a long-form source text and transform it into 3 distinct, platform-optimized social media assets:
1. A LinkedIn Post
2. A 5-Tweet Twitter/X Thread
3. An Email Newsletter Section

CRITICAL BRAND VOICE GUIDELINES TO FOLLOW:
- Target Tone: {{TONE}}
- Structural Rules: {{GUIDELINES}}
- Reference Writing Style Sample: {{SAMPLE_POSTS}}

PLATFORM FORMATTING INSTRUCTIONS:
- LinkedIn: Include an engaging hook line, spaced readable paragraphs (1-2 sentences max per block), bullet points with relevant emojis, and 3 niche hashtags at the end.
- Twitter Thread: Return EXACTLY 5 tweets as an array of strings. Tweet 1 MUST end with a thread emoji (🧵). Each tweet MUST be under 270 characters.
- Newsletter: Format in pristine Markdown. Include a main header (# Title), an intro hook, a bulleted key takeaway section, and a concluding call to action.

OUTPUT REQUIREMENTS:
You MUST return STRICT, VALID JSON containing ONLY the requested keys ("linkedin", "twitterThread", "newsletter"). No conversational responses, no Markdown code blocks (\`\`\`json), and no extraneous text outside the JSON structure.`;

export const generateContent = async (sourceText, brandVoice) => {
    const prompt = systemPromptTemplate
        .replace('{{TONE}}', brandVoice.tone)
        .replace('{{GUIDELINES}}', brandVoice.guidelines)
        .replace('{{SAMPLE_POSTS}}', brandVoice.samplePosts.join('\n\n'));

    const response = await openai.chat.completions.create({
        model: 'gpt-4o', // using 4o for best results, can adjust
        response_format: { type: "json_object" },
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: sourceText }
        ],
    });

    const generateJson = JSON.parse(response.choices[0].message.content);
    return generateJson;
};
