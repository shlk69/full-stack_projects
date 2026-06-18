import {validationResult,body} from 'express-validator'

export const authValidation = [
    // 1. Email validation
    body('email')
        .trim()
        .notEmpty().withMessage('Email address is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(), 

    // 2. Password validation
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 4 }).withMessage('Password must be at least 4 characters long')
];



