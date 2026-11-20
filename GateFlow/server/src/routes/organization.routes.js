
import express from "express";

import {
    createOrganization,
    getOrganization,
    getOrganizationById,
    updateOrg,
    deleteOrg,
    addMemberToOrg,
    respondToInvite,
    deleteMember,
    updateMemberRole,
} from "../controllers/organization.controllers.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

import {
    createOrganizationValidator,
    updateOrganizationValidator,
    addMemberValidator,
    respondToInviteValidator,
    updateMemberRoleValidator,
    orgIdParamValidator,
    memberParamValidator,
    orgValidate,
} from "../validations/organization.validation.js";

const router = express.Router();

// All organization routes require authentication
router.use(authenticateUser);

// Organization CRUD
router.post(
    "/",
    createOrganizationValidator,
    orgValidate,
    createOrganization
);

router.get("/", getOrganization);

router.get(
    "/:orgId",
    orgIdParamValidator,
    orgValidate,
    getOrganizationById
);

router.patch(
    "/:orgId",
    updateOrganizationValidator,
    orgValidate,
    updateOrg
);

router.delete(
    "/:orgId",
    orgIdParamValidator,
    orgValidate,
    deleteOrg
);

// Invitations
router.post(
    "/:orgId/invite",
    addMemberValidator,
    orgValidate,
    addMemberToOrg
);

router.post(
    "/invitations/respond",
    respondToInviteValidator,
    orgValidate,
    respondToInvite
);

// Member management
router.delete(
    "/:orgId/members/:userId",
    memberParamValidator,
    orgValidate,
    deleteMember
);

router.patch(
    "/:orgId/members/:userId",
    updateMemberRoleValidator,
    orgValidate,
    updateMemberRole
);

export default router;
