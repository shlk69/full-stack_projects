import { clerkClient, getAuth } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const authData = getAuth(req);


        console.log("Authenticated:", authData.isAuthenticated);
        console.log("Token Type:", authData.tokenType);
        console.log("Authorization:", req.headers.authorization?.slice(0, 30));

        if (!authData?.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in first.",
            });
        }

        const { userId, has } = authData;

        // Make auth available to controllers
        req.auth = authData;

        const hasPremiumPlan = await has({ plan: "premium" });

        const user = await clerkClient.users.getUser(userId);

        const freeUsage = Number(user.privateMetadata?.free_usage || 0);

        if (!hasPremiumPlan && freeUsage > 0) {
            req.free_usage = freeUsage;
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user.privateMetadata,
                    free_usage: 0,
                },
            });

            req.free_usage = 0;
        }

        req.plan = hasPremiumPlan ? "premium" : "free";

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};