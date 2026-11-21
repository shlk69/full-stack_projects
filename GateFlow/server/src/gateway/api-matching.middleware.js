
import { ApiConfiguration } from "../models/api-configuration.model.js";

export const matchApiConfiguration = async (req, res, next) => {
    try {
        const environmentId = req.environment?._id;

        if (!environmentId) {
            return res.status(401).json({
                success: false,
                message: "Environment authentication required",
            });
        }

        // 1. Get the incoming request path and method.
        const requestPath = req.path;
        const requestMethod = req.method.toUpperCase();

        // 2. Fetch active API configurations for this environment.
        const configurations = await ApiConfiguration.find({
            environmentId,
            status: "active",
        }).lean();

        // 3. Match path prefixes.
        // Longest prefix wins, so /users/admin takes priority over /users.
        const matchingConfigurations = configurations
            .filter((config) => {
                const prefix = config.pathPrefix.replace(/\/+$/, "") || "/";

                if (prefix === "/") {
                    return true;
                }

                return (
                    requestPath === prefix ||
                    requestPath.startsWith(`${prefix}/`)
                );
            })
            .sort((a, b) => {
                return b.pathPrefix.length - a.pathPrefix.length;
            });

        if (matchingConfigurations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No API configuration found for this endpoint",
            });
        }

        // 4. Check whether the HTTP method is allowed.
        const matchedConfig = matchingConfigurations[0];

        const allowedMethods = matchedConfig.allowedMethods.map((method) =>
            method.toUpperCase()
        );

        if (!allowedMethods.includes(requestMethod)) {
            res.set("Allow", allowedMethods.join(", "));

            return res.status(405).json({
                success: false,
                message: "HTTP method not allowed",
                allowedMethods,
            });
        }

        // 5. Remove the matched prefix to get the upstream path.
        const prefix = matchedConfig.pathPrefix.replace(/\/+$/, "") || "/";

        let upstreamPath;

        if (prefix === "/") {
            upstreamPath = requestPath;
        } else {
            upstreamPath = requestPath.slice(prefix.length) || "/";
        }

        // 6. Attach matched configuration to request.
        req.apiConfiguration = matchedConfig;
        req.upstreamPath = upstreamPath;

        next();

    } catch (error) {
        next(error);
    }
};
