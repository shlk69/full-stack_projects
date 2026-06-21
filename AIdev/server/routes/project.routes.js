import { createProject } from "../controllers/project.controller.js";
import { projectValidation } from "../validator/index.js";
import { Router } from 'express'
import { authenticatedUser } from "../middleware/auth.middleware.js";
const router = Router()


router.post('/create', authenticatedUser,projectValidation,createProject)


export default router