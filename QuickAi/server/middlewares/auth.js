import { clerkClient, getAuth } from "@clerk/express"; 

export const auth = async (req, res, next) => {
    try {
        //  Use getAuth(req) instead of req.auth
        const authData = getAuth(req);

        //  Guard rail against unauthenticated tokens
        if (!authData || !authData.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in first."
            });
        }

        const { userId, has } = authData;

        //  Verify your premium plan checking function
        const hasPremiumPlan = await has({ plan: 'premium' });

        //  Fetch user data safely
        const user = await clerkClient.users.getUser(userId);

        if (!hasPremiumPlan && user.privateMetadata.free_usage) {
            req.free_usage = user.privateMetadata.free_usage;
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }

        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
