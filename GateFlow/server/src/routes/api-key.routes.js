
import express from "express";

import {
    createApiKey,
    getApiKeys,
    getApiKeyById,
    rotateApiKey,
    revokeApiKey,
} from "../controllers/api-key.controller.js";

import {
    validateEnvironmentId,
    validateApiKeyId,
    createApiKeyValidation,
} from "../validations/api-key.validations.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

// Environment-scoped routes
router.post(
    "/environments/:environmentId/api-keys",
    createApiKeyValidation,
    createApiKey
);

router.get(
    "/environments/:environmentId/api-keys",
    validateEnvironmentId,
    getApiKeys
);

// Individual API key routes
router.get(
    "/api-keys/:keyId",
    validateApiKeyId,
    getApiKeyById
);

router.post(
    "/api-keys/:keyId/rotate",
    validateApiKeyId,
    rotateApiKey
);

router.delete(
    "/api-keys/:keyId",
    validateApiKeyId,
    revokeApiKey
);

export default router;
