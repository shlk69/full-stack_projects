import {
    body,
    param,
    validationResult,
} from "express-validator";

export const orgIdValidator = [
    param("orgId")
        .isMongoId()
        .withMessage("Invalid organization ID"),
];

export const projectIdValidator = [
    param("projectId")
        .isMongoId()
        .withMessage("Invalid project ID"),
];

export const createProjectValidator = [
    ...orgIdValidator,

    body("name")
        .isString()
        .withMessage("Project name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Project name is required")
        .isLength({ max: 100 })
        .withMessage("Project name cannot exceed 100 characters"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
];

export const updateProjectValidator = [
    ...projectIdValidator,

    body()
        .custom((value) => {
            if (
                !value ||
                !["name", "description"].some(
                    (field) => Object.prototype.hasOwnProperty.call(value, field)
                )
            ) {
                throw new Error("Provide at least one field to update");
            }

            return true;
        }),

    body("name")
        .optional()
        .isString()
        .withMessage("Project name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Project name cannot be empty")
        .isLength({ max: 100 })
        .withMessage("Project name cannot exceed 100 characters"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
];

export const projectValidate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }

    next();
};