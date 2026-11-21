
import express from "express";

import { requestLoggingMiddleware } from "./request-logging.middleware.js";
import { authenticateApiKey } from "./gateway.middleware.js";
import { rateLimitMiddleware } from "./rate-limit.middleware.js";
import { matchApiConfiguration } from "./api-matching.middleware.js";
import { upstreamProxyMiddleware } from "./upstream-proxy.middleware.js";

const router = express.Router();

router.use(
    requestLoggingMiddleware,
    authenticateApiKey,
    rateLimitMiddleware,
    matchApiConfiguration,
    upstreamProxyMiddleware
);

export default router;
