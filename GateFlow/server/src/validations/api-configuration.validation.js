import { body, param, validationResult } from "express-validator";

export const validateApiConfiguration = (req, res, next) => {
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

// Validate environment ID
export const validateEnvironmentId = [
    param("environmentId")
        .isMongoId()
        .withMessage("Invalid environment ID"),
];

// Validate API ID
export const validateApiId = [
    param("apiId")
        .isMongoId()
        .withMessage("Invalid API configuration ID"),
];

// Create API configuration
export const createApiConfigurationValidation = [
    ...validateEnvironmentId,

    body("name")
        .trim()
        .notEmpty()
        .withMessage("API name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("API name must be between 2 and 100 characters"),

    body("description")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("baseUrl")
        .trim()
        .notEmpty()
        .withMessage("Base URL is required")
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true,
        })
        .withMessage("Provide a valid HTTP or HTTPS URL"),

    body("pathPrefix")
        .optional()
        .trim()
        .matches(/^\/[a-zA-Z0-9/_-]*$/)
        .withMessage("Path prefix must start with / and contain valid path characters"),

    body("allowedMethods")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Allowed methods must be a non-empty array"),

    body("allowedMethods.*")
        .optional()
        .isIn(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
        .withMessage("Invalid HTTP method"),

    body("timeoutMs")
        .optional()
        .isInt({ min: 1000, max: 60000 })
        .withMessage("Timeout must be between 1000 and 60000 milliseconds"),

    validateApiConfiguration,
];

// Update API configuration
export const updateApiConfigurationValidation = [
    ...validateApiId,

    body()
        .custom((value) => {
            const allowedFields = [
                "name",
                "description",
                "baseUrl",
                "pathPrefix",
                "allowedMethods",
                "timeoutMs",
                "status",
            ];

            const keys = Object.keys(value);

            if (keys.length === 0) {
                throw new Error("At least one field is required");
            }

            const invalidFields = keys.filter(
                (key) => !allowedFields.includes(key)
            );

            if (invalidFields.length > 0) {
                throw new Error(
                    `Invalid fields: ${invalidFields.join(", ")}`
                );
            }

            return true;
        }),

    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("API name must be between 2 and 100 characters"),

    body("description")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("baseUrl")
        .optional()
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true,
        })
        .withMessage("Provide a valid HTTP or HTTPS URL"),

    body("pathPrefix")
        .optional()
        .matches(/^\/[a-zA-Z0-9/_-]*$/)
        .withMessage("Invalid path prefix"),

    body("allowedMethods")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Allowed methods must be a non-empty array"),

    body("allowedMethods.*")
        .optional()
        .isIn(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
        .withMessage("Invalid HTTP method"),

    body("timeoutMs")
        .optional()
        .isInt({ min: 1000, max: 60000 })
        .withMessage("Timeout must be between 1000 and 60000 milliseconds"),

    body("status")
        .optional()
        .isIn(["active", "disabled"])
        .withMessage("Invalid API status"),

    validateApiConfiguration,
];