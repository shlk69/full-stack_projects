import express from "express";

import {
    createProject,
    getProjects,
    getProjectbyId,
    updateProject,
    deleteProject,
} from "../controllers/project.controllers.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

import {
    orgIdValidator,
    projectIdValidator,
    createProjectValidator,
    updateProjectValidator,
    projectValidate,
} from "../validations/project.validations.js";

const router = express.Router();

router.use(authenticateUser);

// Organization-scoped routes
router.post(
    "/organizations/:orgId/projects",
    createProjectValidator,
    projectValidate,
    createProject
);

router.get(
    "/organizations/:orgId/projects",
    orgIdValidator,
    projectValidate,
    getProjects
);

// Individual project routes
router.get(
    "/projects/:projectId",
    projectIdValidator,
    projectValidate,
    getProjectbyId
);

router.patch(
    "/projects/:projectId",
    updateProjectValidator,
    projectValidate,
    updateProject
);

router.delete(
    "/projects/:projectId",
    projectIdValidator,
    projectValidate,
    deleteProject
);

export default router;