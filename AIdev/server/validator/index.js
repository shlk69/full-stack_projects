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


export const projectValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Project name is required')
        .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters long')
        .isLength({ max: 50 }).withMessage('Project name cannot exceed 50 characters'),

    body('users')
        .isArray({ min: 1 }).withMessage('Users must be an array with at least one user')
        .custom((value) => {
            const isValidObjectId = value.every(id => /^[0-9a-fA-F]{24}$/.test(id));
            if (!isValidObjectId) {
                throw new Error('One or more user IDs are invalid');
            }
            return true;
        })
];



