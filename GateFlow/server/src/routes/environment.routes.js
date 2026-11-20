import express from "express";

import {
    createEnvironment,
    getEnvironments,
    getEnvironmentById,
    updateEnvironment,
    deleteEnvironment,
} from "../controllers/environment.controllers.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

import {
    projectIdValidator,
    environmentIdValidator,
    createEnvironmentValidator,
    updateEnvironmentValidator,
    environmentValidate,
} from "../validations/environment.validations.js";

const router = express.Router();

// All environment routes require authentication
router.use(authenticateUser);

// Project environments
router.post(
    "/projects/:projectId/environments",
    createEnvironmentValidator,
    environmentValidate,
    createEnvironment
);

router.get(
    "/projects/:projectId/environments",
    projectIdValidator,
    environmentValidate,
    getEnvironments
);

// Individual environment
router.get(
    "/environments/:environmentId",
    environmentIdValidator,
    environmentValidate,
    getEnvironmentById
);

router.patch(
    "/environments/:environmentId",
    updateEnvironmentValidator,
    environmentValidate,
    updateEnvironment
);

router.delete(
    "/environments/:environmentId",
    environmentIdValidator,
    environmentValidate,
    deleteEnvironment
);

export default router;