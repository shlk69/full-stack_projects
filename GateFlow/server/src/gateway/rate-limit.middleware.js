
import {redis} from "../config/redis.js";

// Atomically increment the counter and set its expiration.
const RATE_LIMIT_SCRIPT = `
    local current = redis.call("INCR", KEYS[1])

    if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
    end

    local ttl = redis.call("TTL", KEYS[1])

    return { current, ttl }
`;

export const rateLimitMiddleware = async (req, res, next) => {
    try {
        // These values are attached by authenticateApiKey.
        const apiKeyId = req.apiKey?.id;
        const environment = req.environment;

        if (!apiKeyId || !environment) {
            return res.status(401).json({
                success: false,
                message: "API authentication required",
            });
        }

        // Read rate-limit configuration from the environment.
        const maxRequests = environment.rateLimit?.maxRequests ?? 100;
        const windowSeconds = environment.rateLimit?.windowSeconds ?? 60;

        // Create a separate counter for each API key.
        const redisKey = `gateflow:rate-limit:${environment._id}:${apiKeyId}`;

        // Execute the atomic Redis operation.
        const [currentCount, ttl] = await redis.eval(
            RATE_LIMIT_SCRIPT,
            1,
            redisKey,
            windowSeconds
        );

        const remaining = Math.max(0, maxRequests - currentCount);

        // Set rate-limit response headers.
        res.set({
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(
                Math.floor(Date.now() / 1000) + Math.max(0, ttl)
            ),
        });

        // Reject requests exceeding the configured limit.
        if (currentCount > maxRequests) {
            res.set("Retry-After", String(Math.max(1, ttl)));

            return res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
                retryAfter: Math.max(1, ttl),
            });
        }

        next();

    } catch (error) {
        console.error("Rate limiting error:", error.message);

        // Fail closed: don't allow requests to bypass rate limiting
        // when Redis is unavailable.
        return res.status(503).json({
            success: false,
            message: "Gateway temporarily unavailable",
        });
    }
};
