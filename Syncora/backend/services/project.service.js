const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Activity = require('../models/Activity');

exports.createProject = async (userId, data) => {
    const project = await Project.create({
        name: data.name,
        description: data.description,
        owner: userId
    });

    await ProjectMember.create({
        project: project._id,
        user: userId,
        role: 'OWNER'
    });

    await Activity.create({
        project: project._id,
        actor: userId,
        action: 'PROJECT_CREATED',
        metadata: { name: project.name }
    });

    return project;
};

exports.getProjectsForUser = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // Find all memberships
    const memberships = await ProjectMember.find({ user: userId }).select('project');
    const projectIds = memberships.map(m => m.project);

    const [projects, total] = await Promise.all([
        Project.find({ _id: { $in: projectIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Project.countDocuments({ _id: { $in: projectIds } })
    ]);

    return { projects, total };
};

exports.getProjectDetails = async (projectId) => {
    return Project.findById(projectId);
};

exports.updateProject = async (projectId, updates) => {
    return Project.findByIdAndUpdate(projectId, updates, { new: true });
};

exports.deleteProject = async (projectId) => {
    // Delete project schema
    await Project.findByIdAndDelete(projectId);
    // Cleanup linked collections
    await ProjectMember.deleteMany({ project: projectId });
    await Activity.deleteMany({ project: projectId });
    // Note: Would delete issues/comments here later in Phase 5
    return true;
};
