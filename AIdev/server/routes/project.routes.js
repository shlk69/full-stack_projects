import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';
import * as projectValidation from '../validator/index.js'; 

const router = Router();

router.post('/create',
    authMiddleWare.authUser,
    projectValidation.createProject,
    projectController.createProject
);

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProject
);

router.put('/add-user',
    authMiddleWare.authUser,
    projectValidation.addUser,
    projectController.addUserToProject
);

router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
);

router.put('/update-file-tree',
    authMiddleWare.authUser,
    projectValidation.updateFileTree,
    projectController.updateFileTree
);

export default router;
