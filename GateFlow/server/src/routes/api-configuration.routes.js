import express from "express";

import {
    createApiConfiguration,
    getApiConfigurations,
    getApiConfigurationById,
    updateApiConfiguration,
    deleteApiConfiguration,
} from "../controllers/api-configuration.controller.js";

import {
    validateEnvironmentId,
    validateApiId,
    createApiConfigurationValidation,
    updateApiConfigurationValidation,
} from "../validators/api-configuration.validation.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

// Environment-scoped routes
router.post(
    "/environments/:environmentId/apis",
    createApiConfigurationValidation,
    createApiConfiguration
);

router.get(
    "/environments/:environmentId/apis",
    validateEnvironmentId,
    getApiConfigurations
);

// API-scoped routes
router.get(
    "/apis/:apiId",
    validateApiId,
    getApiConfigurationById
);

router.patch(
    "/apis/:apiId",
    updateApiConfigurationValidation,
    updateApiConfiguration
);

router.delete(
    "/apis/:apiId",
    validateApiId,
    deleteApiConfiguration
);

export default router;