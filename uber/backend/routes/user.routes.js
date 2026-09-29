const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const userController = require('../controllers/user.controllers')

router.post(
    '/register',
    [
        body('email')
            .isEmail().withMessage('Please provide a valid email address.')
            .trim()
            .normalizeEmail(),

        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

        body('fullname.firstname')
            .trim()
            .isLength({ min: 3 }).withMessage('First name must be at least 3 characters.'),
    ],
    userController.registerUser
  
);

module.exports = router;

