import { check, validationResult } from 'express-validator'

export const validateAuthInput = [
    check('email').isEmail().normalizeEmail(),
    check('name').trim().notEmpty().withMessage('Name is required'),
]

export const validateAssistant = [
    check('assistantName').trim().notEmpty(),
    check('buisnessName').trim().notEmpty(),
    check('buisnessType').trim().notEmpty(),
]

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
    }
    next()
}
