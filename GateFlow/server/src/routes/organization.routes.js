import express from 'express';
import {
    createOrganization,
    getOrganization,
    getOrganizationById,
    updateOrg,
    deleteOrg,
    addMemberToOrg,
    respondToInvite,
} from '../controllers/organization.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    createOrganizationValidator,
    updateOrganizationValidator,
    addMemberValidator,
    respondToInviteValidator,
    orgIdParamValidator,
    orgValidate,
} from '../validators/organization.validator.js';

const router = express.Router();

// Require valid Bearer access token on all organization routes
router.use(authenticateUser);

// Organization CRUD
router.post('/', createOrganizationValidator, orgValidate, createOrganization);
router.get('/', getOrganization);
router.get('/:orgId', orgIdParamValidator, orgValidate, getOrganizationById);
router.patch('/:orgId', updateOrganizationValidator, orgValidate, updateOrg);
router.delete('/:orgId', orgIdParamValidator, orgValidate, deleteOrg);

// Member Invitations
router.post('/:orgId/invite', addMemberValidator, orgValidate, addMemberToOrg);
router.post('/invitations/respond', respondToInviteValidator, orgValidate, respondToInvite);

export default router;
