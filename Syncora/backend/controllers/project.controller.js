const projectService = require('../services/project.service');
const Activity = require('../models/Activity');

exports.createProject = async (req, res, next) => {
    try {
        const project = await projectService.createProject(req.user.userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProjects = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const { projects, total } = await projectService.getProjectsForUser(req.user.userId, page, limit);

        res.json({
            success: true,
            message: 'Projects retrieved',
            data: {
                items: projects,
                pagination: {
                    page, limit, total, totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProject = async (req, res, next) => {
    try {
        // Request has already passed through `requireRole` in router (which guarantees membership)
        const project = await projectService.getProjectDetails(req.params.id);
        res.json({
            success: true, message: 'Project retrieved', data: { project }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProject = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body);

        await Activity.create({
            project: req.params.id, actor: req.user.userId, action: 'PROJECT_UPDATED', metadata: { updates: req.body }
        });

        res.json({
            success: true, message: 'Project updated', data: { project }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.params.id);
        res.json({
            success: true, message: 'Project deleted successfully', data: {}
        });
    } catch (error) {
        next(error);
    }
};
