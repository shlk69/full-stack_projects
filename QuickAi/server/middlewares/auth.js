import { clerkClient, getAuth } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const authData = getAuth(req);

        if (!authData?.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in first.",
            });
        }

        const { userId, has } = authData;

        // Make auth available to controllers
        req.auth = authData;

        const user = await clerkClient.users.getUser(userId);

        const storedPlan =
            user.publicMetadata?.plan ??
            user.privateMetadata?.plan ??
            user.publicMetadata?.subscription?.plan ??
            user.privateMetadata?.subscription?.plan;

        const normalizedPlan = typeof storedPlan === "string" ? storedPlan.toLowerCase() : "";
        const hasPremiumAccess = normalizedPlan === "premium" || normalizedPlan === "pro" || normalizedPlan === "plus";
        const hasPremiumPlan = hasPremiumAccess || (await has({ plan: "premium" }));

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