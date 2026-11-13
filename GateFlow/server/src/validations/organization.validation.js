import { body, param } from 'express-validator'

// Reusable slug rule
const slugRule = (field) =>
    field
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Slug must be between 3 and 50 characters')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('Slug can only contain lowercase letters, numbers, and hyphens');

// 1. Create Organization Validation
export const createOrganizationValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Organization name must be between 2 and 100 characters'),

    slugRule(body('slug').optional()),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
];

// 2. Update Organization Validation
export const updateOrganizationValidator = [
    param('orgId').isMongoId().withMessage('Invalid organization ID'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Organization name must be between 2 and 100 characters'),

    slugRule(body('slug').optional()),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('status')
        .optional()
        .isIn(['active', 'disabled'])
        .withMessage('Status must be either active or disabled'),
];

// 3. Add Member Validation
export const addMemberValidator = [
    param('orgId').isMongoId().withMessage('Invalid organization ID'),

    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID'),

    body('role')
        .optional()
        .isIn(['admin', 'developer', 'viewer'])
        .withMessage('Role must be admin, developer, or viewer'),
];

// 4. Update Member Role Validation
export const updateMemberRoleValidator = [
    param('orgId').isMongoId().withMessage('Invalid organization ID'),
    param('userId').isMongoId().withMessage('Invalid user ID'),

    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'developer', 'viewer'])
        .withMessage('Role must be admin, developer, or viewer'),
];

// 5. Remove Member / Get Org by ID Validation
export const orgIdParamValidator = [
    param('orgId').isMongoId().withMessage('Invalid organization ID'),
];

export const memberParamValidator = [
    param('orgId').isMongoId().withMessage('Invalid organization ID'),
    param('userId').isMongoId().withMessage('Invalid user ID'),
];


export const orgValidate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // Everything is clean, proceed to the controller
    }

    // If there are errors, return a 400 Bad Request with the list of errors
    return res.status(400).json({
        status: 'fail',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
};