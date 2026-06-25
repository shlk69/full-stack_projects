const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateGeminiResponse = async ({
    prompt,
    apikey,
    user,
    retries = 3,
}) => {
    const apiKey = apikey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Gemini API key is missing.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(
            `${process.env.GEMINI_URL}?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        clearTimeout(timeout);

        // Success
        if (response.ok) {
            const data = await response.json();

            const text =
                data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No response returned from Gemini.");
            }

            if (
                user &&
                typeof user.save === "function" &&
                user.geminiStatus !== "active"
            ) {
                user.geminiStatus = "active";
                await user.save();
            }

            return text.trim();
        }

        // Read Gemini error
        const errorData = await response.json().catch(() => ({}));

        const errorMessage =
            errorData?.error?.message || "Unknown Gemini API error.";

        switch (response.status) {
            case 400:
            case 401:
                if (
                    user &&
                    typeof user.save === "function" &&
                    user.geminiStatus !== "invalid"
                ) {
                    user.geminiStatus = "invalid";
                    await user.save();
                }

                throw new Error(`Invalid Gemini API Key. ${errorMessage}`);

            case 429:
                if (
                    user &&
                    typeof user.save === "function" &&
                    user.geminiStatus !== "quota_exceeded"
                ) {
                    user.geminiStatus = "quota_exceeded";
                    await user.save();
                }

                throw new Error(`Gemini quota exceeded. ${errorMessage}`);

            case 503:
                if (retries > 0) {
                    console.warn(
                        `Gemini overloaded. Retrying... (${retries} attempts left)`
                    );

                    await sleep((4 - retries) * 1000);

                    return generateGeminiResponse({
                        prompt,
                        apikey,
                        user,
                        retries: retries - 1,
                    });
                }

                throw new Error(
                    "Gemini service is currently busy. Please try again later."
                );

            default:
                throw new Error(errorMessage);
        }
    } catch (error) {
        clearTimeout(timeout);

        if (error.name === "AbortError") {
            throw new Error("Gemini request timed out.");
        }

        console.error("Gemini Fetch Error:", error.message);

        throw error;
    }
};