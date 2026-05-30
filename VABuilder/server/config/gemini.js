export const generateGeminiResponse = async ({
    prompt,
    apikey,
    user
}) => {
    try {
        // FIXED: Fall back to your server's .env file if a per-user key wasn't passed down
        const finalApiKey = apikey || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            throw new Error('Api key is missing');
        }

        const response = await fetch(`${process.env.GEMINI_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // FIXED: Changed 'api.trim()' to use 'finalApiKey.trim()'
                'x-goog-api-key': finalApiKey.trim()
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            // Invalid API Key
            if (response.status === 400 || response.status === 401) {
                if (user && typeof user.save === 'function') {
                    user.geminiStatus = "invalid";
                    await user.save();
                }
            }

            // Quota Exceeded
            if (response.status === 429) {
                if (user && typeof user.save === 'function') {
                    user.geminiStatus = "quota_exceeded";
                    await user.save();
                }
            }

            const err = await response.text();
            throw new Error(err);
        }

        if (user && typeof user.save === 'function') {
            user.geminiStatus = 'active';
            await user.save();
        }

        const data = await response.json();

        // Using optional chaining safely to extract the generated text response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No text returned from Gemini");
        }

        return text.trim();
    }
    catch (error) {
        console.log("Gemini Fetch Error:", error.message);
        throw new Error(`Gemini API fetch failed: ${error.message}`);
    }
};
