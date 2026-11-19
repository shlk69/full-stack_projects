import crypto from "crypto";

import { Environment } from "../models/environment.model.js";
import { Organization } from "../models/organization.model.js";
import { Project } from "../models/project.model.js";

const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// Check whether user can access the organization
const getOrganizationPermissions = (org, project, userId) => {
    const id = userId.toString();

    const isOrgOwner = org.owner.toString() === id;

    const requesterMember = org.members.find(
        (member) => member.userId.toString() === id
    );

    const isOrgMember = isOrgOwner || Boolean(requesterMember);

    const isOrgAdmin = requesterMember?.role === "admin";

    const isProjectCreator = project.createdBy.toString() === id;

    return {
        isOrgMember,
        canManage:
            isOrgOwner || isOrgAdmin || isProjectCreator,
    };
};

// Find project and organization and verify membership
const getProjectContext = async (projectId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        return { error: "PROJECT_NOT_FOUND" };
    }

    const org = await Organization.findById(project.organizationId);

    if (!org) {
        return { error: "ORGANIZATION_NOT_FOUND" };
    }

    const permissions = getOrganizationPermissions(
        org,
        project,
        userId
    );

    if (!permissions.isOrgMember) {
        return { error: "FORBIDDEN" };
    }

    return { project, org, ...permissions };
};

// Create environment

export const createEnvironment = async (req, res) => {
    try {
        const { projectId } = req.params;

        const {
            name,
            description,
            type,
            baseUrl,
            rateLimit,
        } = req.body;

        const currentUserId = req.user.id;

        // 1. Find project and check organization membership
        const context = await getProjectContext(
            projectId,
            currentUserId
        );

        if (context.error === "PROJECT_NOT_FOUND") {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (context.error === "ORGANIZATION_NOT_FOUND") {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        if (context.error === "FORBIDDEN") {
            return res.status(403).json({
                message: "You do not have access to this project",
            });
        }

        // 2. Check management permission
        if (!context.canManage) {
            return res.status(403).json({
                message: "You don't have permission to create environments",
            });
        }

        // 3. Generate slug
        let slug = generateSlug(name);

        if (!slug) {
            slug = `environment-${crypto.randomBytes(3).toString("hex")}`;
        }

        // 4. Resolve existing slug
        const existingEnvironment = await Environment.findOne({
            projectId,
            slug,
        });

        if (existingEnvironment) {
            slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
        }

        // 5. Create environment
        const environment = await Environment.create({
            name,
            slug,
            description,
            projectId,
            type,
            baseUrl: baseUrl || "",
            rateLimit: {
                maxRequests: rateLimit?.maxRequests ?? 100,
                windowSeconds: rateLimit?.windowSeconds ?? 60,
            },
            createdBy: currentUserId,
        });

        return res.status(201).json({
            message: "Environment created successfully",
            data: environment,
        });

    } catch (error) {
        console.error("Error creating environment:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "An environment with this type or slug already exists in this project",
            });
        }

        return res.status(500).json({
            message: "Unable to create environment",
        });
    }
};

// Get all environments belonging to a project
export const getEnvironments = async (req, res) => {
    try {
        const { projectId } = req.params;
        const currentUserId = req.user.id;

        const context = await getProjectContext(
            projectId,
            currentUserId
        );

        if (context.error === "PROJECT_NOT_FOUND") {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (context.error === "ORGANIZATION_NOT_FOUND") {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        if (context.error === "FORBIDDEN") {
            return res.status(403).json({
                message: "You do not have access to this project",
            });
        }

        const environments = await Environment.find({
            projectId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Environments fetched successfully",
            count: environments.length,
            data: environments,
        });

    } catch (error) {
        console.error("Error fetching environments:", error);

        return res.status(500).json({
            message: "Unable to fetch environments",
        });
    }
};

// Get a single environment
export const getEnvironmentById = async (req, res) => {
    try {
        const { environmentId } = req.params;
        const currentUserId = req.user.id;

        const environment = await Environment.findById(environmentId);

        if (!environment) {
            return res.status(404).json({
                message: "Environment not found",
            });
        }

        const context = await getProjectContext(
            environment.projectId,
            currentUserId
        );

        if (
            context.error === "PROJECT_NOT_FOUND" ||
            context.error === "ORGANIZATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Project or organization not found",
            });
        }

        if (context.error === "FORBIDDEN") {
            return res.status(403).json({
                message: "You do not have access to this environment",
            });
        }

        return res.status(200).json({
            message: "Environment fetched successfully",
            data: environment,
        });

    } catch (error) {
        console.error("Error fetching environment:", error);

        return res.status(500).json({
            message: "Unable to fetch environment",
        });
    }
};

// Update environment
export const updateEnvironment = async (req, res) => {
    try {
        const { environmentId } = req.params;
        const {
            name,
            description,
            baseUrl,
            rateLimit,
            status,
        } = req.body;

        const currentUserId = req.user.id;

        const environment = await Environment.findById(environmentId);

        if (!environment) {
            return res.status(404).json({
                message: "Environment not found",
            });
        }

        const context = await getProjectContext(
            environment.projectId,
            currentUserId
        );

        if (
            context.error === "PROJECT_NOT_FOUND" ||
            context.error === "ORGANIZATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Project or organization not found",
            });
        }

        if (context.error === "FORBIDDEN") {
            return res.status(403).json({
                message: "You do not have access to this environment",
            });
        }

        if (!context.canManage) {
            return res.status(403).json({
                message: "You don't have permission to update this environment",
            });
        }

        // Only update fields explicitly provided by the client
        if (name !== undefined) environment.name = name;

        if (description !== undefined) {
            environment.description = description;
        }

        if (baseUrl !== undefined) {
            environment.baseUrl = baseUrl;
        }

        if (status !== undefined) {
            environment.status = status;
        }

        if (rateLimit !== undefined) {
            if (rateLimit.maxRequests !== undefined) {
                environment.rateLimit.maxRequests =
                    rateLimit.maxRequests;
            }

            if (rateLimit.windowSeconds !== undefined) {
                environment.rateLimit.windowSeconds =
                    rateLimit.windowSeconds;
            }
        }

        await environment.save();

        return res.status(200).json({
            message: "Environment updated successfully",
            data: environment,
        });

    } catch (error) {
        console.error("Error updating environment:", error);

        return res.status(500).json({
            message: "Unable to update environment",
        });
    }
};

export const deleteEnvironment = async (req, res) => {
    try {
        const { environmentId } = req.params;
        const currentUserId = req.user.id;

        const environment = await Environment.findById(environmentId);

        if (!environment) {
            return res.status(404).json({
                message: "Environment not found",
            });
        }

        const context = await getProjectContext(
            environment.projectId,
            currentUserId
        );

        if (
            context.error === "PROJECT_NOT_FOUND" ||
            context.error === "ORGANIZATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Project or organization not found",
            });
        }

        if (context.error === "FORBIDDEN") {
            return res.status(403).json({
                message: "You do not have access to this environment",
            });
        }

        if (!context.canManage) {
            return res.status(403).json({
                message: "You don't have permission to delete this environment",
            });
        }

        await Environment.findByIdAndDelete(environmentId);

        return res.status(200).json({
            message: "Environment deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting environment:", error);

        return res.status(500).json({
            message: "Unable to delete environment",
        });
    }
};