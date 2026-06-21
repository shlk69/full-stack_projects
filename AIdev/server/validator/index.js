import mongoose from 'mongoose';
import Project from '../models/project.model.js'; 
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



export const createProject = [
    body('name')
        .isString().withMessage('Name must be a string')
        .trim()
        .notEmpty().withMessage('Name is required')
        .custom(async (value) => {
            const existingProject = await Project.findOne({ name: value.toLowerCase() });
            if (existingProject) {
                throw new Error('Project name must be unique');
            }
            return true;
        })
];

export const addUser = [
    body('projectId')
        .isString().withMessage('Project ID must be a string')
        .trim()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid Project ID format'),

    body('users')
        .isArray({ min: 1 }).withMessage('Users must be an array with at least one user ID')
        .bail()
        .custom((users) => users.every(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)))
        .withMessage('Each user must be a valid MongoDB ObjectId string')
];

export const updateFileTree = [
    body('projectId')
        .isString().withMessage('Project ID must be a string')
        .trim()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid Project ID format'),

    body('fileTree')
        .isObject().withMessage('File tree must be a valid object structure')
];



