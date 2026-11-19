
import { body, param, validationResult } from "express-validator";

export const validateApiKeyRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            })),
        });
    }

    next();
};

export const validateEnvironmentId = [
    param("environmentId")
        .isMongoId()
        .withMessage("Invalid environment ID"),
];

export const validateApiKeyId = [
    param("keyId")
        .isMongoId()
        .withMessage("Invalid API key ID"),
];

export const createApiKeyValidation = [
    ...validateEnvironmentId,

    body("name")
        .trim()
        .notEmpty()
        .withMessage("API key name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters"),

    body("expiresAt")
        .optional({ values: "null" })
        .isISO8601()
        .withMessage("Provide a valid expiration date"),

    validateApiKeyRequest,
];
