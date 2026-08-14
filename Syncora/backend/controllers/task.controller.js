const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasksByProject = async (req, res, next) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId }).sort({ order: 1, createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

exports.createTask = async (req, res, next) => {
    try {
        const { title, description, status, projectId } = req.body;

        const project = await Project.findOne({ _id: projectId, owner: req.user.userId });
        if (!project) return res.status(403).json({ message: 'Not authorized for this project' });

        // Find highest order
        const lastTask = await Task.findOne({ project: projectId, status }).sort({ order: -1 });
        const order = lastTask ? lastTask.order + 1 : 0;

        const task = await Task.create({
            title, description, status, project: projectId, createdBy: req.user.userId, order
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const { title, description, status, order } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.userId },
            { title, description, status, order },
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.userId });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
};
