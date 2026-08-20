const ProjectWorkspace = require('../models/ProjectWorkspace');
const AuditReport = require('../models/AuditReport');

exports.createWorkspace = async (req, res) => {
    try {
        const { title, files } = req.body;
        const workspace = new ProjectWorkspace({
            userId: req.user.userId,
            title,
            files
        });
        await workspace.save();
        res.json(workspace);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkspaces = async (req, res) => {
    try {
        const workspaces = await ProjectWorkspace.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkspace = async (req, res) => {
    try {
        const workspace = await ProjectWorkspace.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        const latestAudit = await AuditReport.findOne({ projectId: workspace._id }).sort({ createdAt: -1 });

        res.json({ workspace, latestAudit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteWorkspace = async (req, res) => {
    try {
        const workspace = await ProjectWorkspace.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        await AuditReport.deleteMany({ projectId: req.params.id });
        res.json({ message: 'Workspace deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
