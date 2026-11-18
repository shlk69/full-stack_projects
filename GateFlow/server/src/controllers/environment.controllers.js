import { Environment } from "../models/environment.model.js";
import { Organization } from "../models/organization.model.js";
import { Project } from "../models/project.model.js";
import crypto from "crypto";

const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

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

        const currentUserId = req.user._id;

        // 1. Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // 2. Find organization
        const org = await Organization.findById(
            project.organizationId
        );

        if (!org) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        // 3. Check permissions
        const isOrgOwner =
            org.owner.toString() === currentUserId.toString();

        const requesterMember = org.members.find(
            (member) =>
                member.userId.toString() === currentUserId.toString()
        );

        const isOrgAdmin =
            requesterMember?.role === "admin";

        const isProjectCreator =
            project.createdBy.toString() === currentUserId.toString();

        const canManageEnvironment =
            isOrgOwner || isOrgAdmin || isProjectCreator;

        if (!canManageEnvironment) {
            return res.status(403).json({
                message: "You don't have permission to manage environments",
            });
        }

        // 4. Generate slug
        let slug = generateSlug(name);

        if (!slug) {
            slug = `environment-${crypto.randomBytes(3).toString("hex")}`;
        }

        // 5. Check slug uniqueness within project
        const existingEnvironment = await Environment.findOne({
            projectId,
            slug,
        });

        if (existingEnvironment) {
            slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
        }

        // 6. Create environment
        const environment = await Environment.create({
            name,
            slug,
            description,
            projectId,
            type,
            baseUrl,
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
        console.error("Error while creating environment:", error);

        return res.status(500).json({
            message: "Unable to create environment",
        });
    }
};


export const getEnvironments = async (req, res) => {
    try {
        const { projectId } = req.params
        const currentUserId = req.user._id
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({message:'No project created'})
        }
        const org = await Organization.findById(project.organizationId)
        if (!org) {
            return res.status(404).json({message:'Join organization first'})
        }

        const isOwner = org.owner.toString() === currentUserId.toString()

        const requesterMember = org.members.find((m) => m.userId.toString() === currentUserId.toString())
        const isAdmin = requesterMember?.role === 'admin'
        const isProjectCreator = project.createdBy.toString() === currentUserId.toString()
   
        if (!isOwner || !isProjectCreator || !isAdmin) {
            return res.status(403).json({message:'You are not authorized to see the environments'})
        }

        const environments = await Environment.findById({projectId:project._id})

    } catch (error) {
        
    }
}


// Method	Endpoint	Purpose
// POST / projects /: projectId / environments	Create environment
// GET / projects /: projectId / environments	List environments
// GET / environments /:environmentId	Get environment
// PATCH / environments /:environmentId	Update environment
// DELETE / environments /:environmentId	Delete environment