import crypto from 'crypto'
import mongoose from "mongoose";
import { Organization } from "../models/organization.model.js";
import { Project } from "../models/project.model.js";

const generateSlug = (text) => {
    if (!text) return '';

    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};


export const createProject = async (req, res) => {
    try {
        const { name, description } = req.body
        const { orgId } = req.params
        const currentUserId = req.user.id

        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }

        let slug = generateSlug(name);

        if (!slug) {
            slug = `org-${crypto.randomBytes(3).toString('hex')}`;
        }


        const existingProject = await Project.findOne({
            organizationId: orgId,
            slug,
        });
        if (existingProject) {
            const suffix = crypto.randomBytes(2).toString('hex');
            slug = `${slug}-${suffix}`;
        }
        
        const isOwner = org.owner.toString() === currentUserId.toString()
        const reqeusterMember = org.members.find((m => m.userId.toString() === currentUserId.toString()))

        const isAdmin = reqeusterMember?.role === 'admin'
        if (!isOwner && !isAdmin) {
            return res.status(403).json({message:'Only owner and admins can create projects'})
        }
        const project = await Project.create({
            name,
            description,
            slug,
            organizationId: orgId,
            createdBy: req.user._id
        })
        return res.status(201).json({ message: 'Project created successfully ', data: project })

    } catch (error) {
        console.log('error while creating project', error.message)
        return res.status(500).json({ message: 'Unable to create project' })
    }
}

export const getProjects = async (req, res) => {
    try {
        const { orgId } = req.params
        const currentUserId = req.user._id
        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' })
        }

        
        const projects = await Project.find({ organizationId: orgId }).sort({ createdAt: -1 })
        
        if (!projects) {
            return res.status(404).json({ message: 'Projects not found' })
        }
        const isMember = org.members.some((m) => m.userId.toString() === currentUserId.toString())
        
        if (!isMember) {
            return res.status(403).json({message:'You are not the member of this organization'})
        }
        return res.status(200).json({ message: 'Project fetched successfully', data: projects })
    } catch (error) {
        console.log('Error while fetching organization the projects ', error.message)
        return res.status(500).json({ message: 'Unable to fetch the projects' })
    }
}

export const getProjectbyId = async (req, res) => {
    try {
        const { projectId } = req.params
        const currentUserId = req.user._id
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }
        const orgId = project.organizationId
        const org = await Organization.findById(orgId)
        const isMember = org.members.some((m) => m.userId.toString() === currentUserId.toString())
        if (!isMember) {
            return res.status(403).json({ message: 'You are not the member of this organization' })
        }
        return res.status(200).json({ message: 'Fetched project', data: project })
    } catch (error) {
        console.log('Error while fetching a project ', error.message)
        return res.status(500).json({ message: 'Unable to fetch a project' })
    }
}

export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        const currentUserId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const org = await Organization.findById(project.organizationId);
        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const isOwner = org.owner.toString() === currentUserId.toString();
        const requesterMember = org.members.find(
            (m) => m.userId.toString() === currentUserId.toString()
        );
        const isAdmin = requesterMember?.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Only the owner and admins can update projects",
            });
        }

        // Only regenerate slug if a new, different name was provided
        if (name && name.trim() && name.trim() !== project.name) {
            let slug = generateSlug(name);

            if (!slug) {
                slug = `project-${crypto.randomBytes(3).toString("hex")}`;
            }

            // Exclude the current project from the collision check
            const existingProject = await Project.findOne({
                organizationId: project.organizationId,
                slug,
                _id: { $ne: project._id },
            });

            if (existingProject) {
                const suffix = crypto.randomBytes(2).toString("hex");
                slug = `${slug}-${suffix}`;
            }

            project.name = name.trim();
            project.slug = slug;
        }

        // Update description if provided (allows clearing it to "")
        if (description !== undefined) {
            project.description = description;
        }

        await project.save();

        return res.status(200).json({
            message: "Project updated successfully",
            data: project,
        });

    } catch (error) {
        console.error("Error while updating a project:", error);
        return res.status(500).json({ message: "Unable to update the project" });
    }
};


export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({message:'Project not found'})
        }
        const org = await Organization.findById(project.organizationId);
        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const isOwner = org.owner.toString() === currentUserId.toString();
        const requesterMember = org.members.find(
            (m) => m.userId.toString() === currentUserId.toString()
        );
        const isAdmin = requesterMember?.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Only the owner and admins can delete projects",
            });
        }
        await Project.findByIdAndDelete(projectId);
        return res.status(200).json({message:'Project deleted succesfully'})
    } catch (error) {
        console.log('Error while deleting a project')
        return res.status(500).json({message:'Unable to delete the project'})
    }
}