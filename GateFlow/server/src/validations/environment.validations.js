import {
    body,
    param,
    validationResult,
} from "express-validator";

// Validate project ID
export const projectIdValidator = [
    param("projectId")
        .isMongoId()
        .withMessage("Invalid project ID"),
];

// Validate environment ID
export const environmentIdValidator = [
    param("environmentId")
        .isMongoId()
        .withMessage("Invalid environment ID"),
];

// Create environment validation
export const createEnvironmentValidator = [
    ...projectIdValidator,

    body("name")
        .isString()
        .withMessage("Environment name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Environment name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Environment name must be between 2 and 50 characters"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Description cannot exceed 300 characters"),

    body("type")
        .isIn(["development", "staging", "production"])
        .withMessage("Invalid environment type"),

    body("baseUrl")
        .optional({ checkFalsy: true })
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true,
        })
        .withMessage("Enter a valid HTTP or HTTPS base URL"),

    body("rateLimit")
        .optional()
        .isObject()
        .withMessage("Rate limit must be an object"),

    body("rateLimit.maxRequests")
        .optional()
        .isInt({ min: 1, max: 1000000 })
        .withMessage("Max requests must be between 1 and 1000000")
        .toInt(),

    body("rateLimit.windowSeconds")
        .optional()
        .isInt({ min: 1, max: 86400 })
        .withMessage("Window seconds must be between 1 and 86400")
        .toInt(),
];

// Update environment validation
export const updateEnvironmentValidator = [
    ...environmentIdValidator,

    body()
        .custom((value) => {
            const allowedFields = [
                "name",
                "description",
                "baseUrl",
                "rateLimit",
                "status",
            ];

            const hasAllowedField = allowedFields.some((field) =>
                Object.prototype.hasOwnProperty.call(value, field)
            );

            if (!hasAllowedField) {
                throw new Error("Provide at least one field to update");
            }

            const unexpectedFields = Object.keys(value).filter(
                (field) => !allowedFields.includes(field)
            );

            if (unexpectedFields.length > 0) {
                throw new Error("Request contains unsupported fields");
            }

            return true;
        }),

    body("name")
        .optional()
        .isString()
        .withMessage("Environment name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Environment name cannot be empty")
        .isLength({ min: 2, max: 50 })
        .withMessage("Environment name must be between 2 and 50 characters"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Description cannot exceed 300 characters"),

    body("baseUrl")
        .optional()
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true,
        })
        .withMessage("Enter a valid HTTP or HTTPS base URL"),

    body("status")
        .optional()
        .isIn(["active", "disabled"])
        .withMessage("Status must be active or disabled"),

    body("rateLimit")
        .optional()
        .isObject()
        .withMessage("Rate limit must be an object"),

    body("rateLimit.maxRequests")
        .optional()
        .isInt({ min: 1, max: 1000000 })
        .withMessage("Max requests must be between 1 and 1000000")
        .toInt(),

    body("rateLimit.windowSeconds")
        .optional()
        .isInt({ min: 1, max: 86400 })
        .withMessage("Window seconds must be between 1 and 86400")
        .toInt(),
];

// Handle validation errors
export const environmentValidate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }

    next();
};