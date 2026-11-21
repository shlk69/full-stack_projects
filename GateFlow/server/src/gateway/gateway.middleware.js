
import crypto from "crypto";
import { ApiKey } from "../models/api-key.model.js";
import { Environment } from "../models/environment.model.js";

export const authenticateApiKey = async (req, res, next) => {
    try {
        const rawKey = req.headers["x-api-key"];

        if (!rawKey) {
            return res.status(401).json({
                success: false,
                message: "API key is required",
            });
        }

        // 2. Validate API key format
        const keyRegex = /^gf_live_[a-f0-9]{64}$/;

        if (!keyRegex.test(rawKey)) {
            return res.status(401).json({
                success: false,
                message: "Invalid API key",
            });
        }

        const keyHash = crypto
            .createHash("sha256")
            .update(rawKey)
            .digest("hex");

        const apiKey = await ApiKey.findOne({ keyHash });

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "Invalid API key",
            });
        }

        // 5. Check API key status
        if (apiKey.status !== "active") {
            return res.status(401).json({
                success: false,
                message: "API key is revoked",
            });
        }

        // 6. Check API key expiration
        if (apiKey.expiresAt && apiKey.expiresAt <= new Date()) {
            return res.status(401).json({
                success: false,
                message: "API key has expired",
            });
        }

        // 7. Find associated environment
        const environment = await Environment.findById(
            apiKey.environmentId
        );

        if (!environment || environment.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Environment is unavailable",
            });
        }

        // 8. Attach gateway context to request
        req.apiKey = {
            id: apiKey._id,
            name: apiKey.name,
            environmentId: apiKey.environmentId,
        };

        req.environment = environment;

        // 9. Update last used timestamp (non-blocking)
        void ApiKey.updateOne(
            { _id: apiKey._id },
            { $set: { lastUsedAt: new Date() } }
        ).catch((error) => {
            console.error("Failed to update API key usage:", error.message);
        });

        next();

    } catch (error) {
        next(error);
    }
};
