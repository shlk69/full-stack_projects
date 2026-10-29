import { body, validationResult } from 'express-validator';

// 1. Define the validation rules for Registration
export const registerValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters long'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(), 

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// 2. Define the validation rules for Login
export const loginValidationRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// 3. Middleware to intercept and send errors back to the client
export const validate = (req, res, next) => {
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
