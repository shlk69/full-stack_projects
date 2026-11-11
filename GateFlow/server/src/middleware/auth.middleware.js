
import { User } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/token.js";

export async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        if (decoded.type !== "access") {
            return res.status(401).json({
                success: false,
                message: "Authentication failed",
            });
        }

        const user = await User.findById(decoded.sub);

        if (!user || user.status !== "active") {
            return res.status(401).json({
                success: false,
                message: "Authentication failed",
            });
        }

        req.user = user

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed",
            });
        }
    }
}
