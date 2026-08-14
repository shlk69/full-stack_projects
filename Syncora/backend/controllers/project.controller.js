const Project = require('../models/Project');

exports.getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ owner: req.user.userId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

exports.createProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const project = await Project.create({ name, description, owner: req.user.userId });
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        // NOTE: Should also delete tasks related to project ideally
        res.json({ message: 'Project deleted' });
    } catch (error) {
        next(error);
    }
};
