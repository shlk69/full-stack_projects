import mongoose from "mongoose";
import { ApiConfiguration } from "../models/api-configuration.model.js";
import { Environment } from "../models/environment.model.js";
import { Project } from "../models/project.model.js";
import { Organization } from "../models/organization.model.js";

// Helper: Get environment, project and organization permissions
const getEnvironmentContext = async (environmentId, userId) => {
    const environment = await Environment.findById(environmentId);

    if (!environment) {
        return { error: "ENVIRONMENT_NOT_FOUND" };
    }

    const project = await Project.findById(environment.projectId);

    if (!project) {
        return { error: "PROJECT_NOT_FOUND" };
    }

    const organization = await Organization.findById(
        project.organizationId
    );

    if (!organization) {
        return { error: "ORGANIZATION_NOT_FOUND" };
    }

    const isOwner =
        organization.owner.toString() === userId.toString();

    const member = organization.members.find(
        (member) => member.userId.toString() === userId.toString()
    );

    if (!isOwner && !member) {
        return { error: "FORBIDDEN" };
    }

    const isAdmin = member?.role === "admin";

    const isProjectCreator =
        project.createdBy.toString() === userId.toString();

    return {
        environment,
        project,
        organization,
        canManage: isOwner || isAdmin || isProjectCreator,
    };
};

// Create API configuration
export const createApiConfiguration = async (req, res, next) => {
    try {
        const { environmentId } = req.params;
        const {
            name,
            description,
            baseUrl,
            pathPrefix,
            allowedMethods,
            timeoutMs,
        } = req.body;

        const context = await getEnvironmentContext(
            environmentId,
            req.user.id
        );

        if (context.error) {
            const statusCode =
                context.error === "FORBIDDEN" ? 403 : 404;

            return res.status(statusCode).json({
                success: false,
                message: context.error,
            });
        }

        if (!context.canManage) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to create APIs",
            });
        }

        const apiConfiguration = await ApiConfiguration.create({
            name,
            description,
            baseUrl,
            pathPrefix: pathPrefix || "/",
            allowedMethods: allowedMethods || ["GET"],
            timeoutMs: timeoutMs || 10000,
            environmentId,
            createdBy: req.user.id,
        });

        return res.status(201).json({
            success: true,
            message: "API configuration created successfully",
            data: apiConfiguration,
        });
    } catch (error) {
        next(error);
    }
};

// Get all APIs inside an environment
export const getApiConfigurations = async (req, res, next) => {
    try {
        const { environmentId } = req.params;

        const context = await getEnvironmentContext(
            environmentId,
            req.user.id
        );

        if (context.error) {
            const statusCode =
                context.error === "FORBIDDEN" ? 403 : 404;

            return res.status(statusCode).json({
                success: false,
                message: context.error,
            });
        }

        const apis = await ApiConfiguration.find({
            environmentId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: apis.length,
            data: apis,
        });
    } catch (error) {
        next(error);
    }
};

// Get a single API configuration
export const getApiConfigurationById = async (req, res, next) => {
    try {
        const { apiId } = req.params;

        const apiConfiguration = await ApiConfiguration.findById(apiId);

        if (!apiConfiguration) {
            return res.status(404).json({
                success: false,
                message: "API configuration not found",
            });
        }

        const context = await getEnvironmentContext(
            apiConfiguration.environmentId,
            req.user.id
        );

        if (context.error) {
            const statusCode =
                context.error === "FORBIDDEN" ? 403 : 404;

            return res.status(statusCode).json({
                success: false,
                message: context.error,
            });
        }

        return res.status(200).json({
            success: true,
            data: apiConfiguration,
        });
    } catch (error) {
        next(error);
    }
};

// Update API configuration
export const updateApiConfiguration = async (req, res, next) => {
    try {
        const { apiId } = req.params;

        const apiConfiguration = await ApiConfiguration.findById(apiId);

        if (!apiConfiguration) {
            return res.status(404).json({
                success: false,
                message: "API configuration not found",
            });
        }

        const context = await getEnvironmentContext(
            apiConfiguration.environmentId,
            req.user.id
        );

        if (context.error) {
            const statusCode =
                context.error === "FORBIDDEN" ? 403 : 404;

            return res.status(statusCode).json({
                success: false,
                message: context.error,
            });
        }

        if (!context.canManage) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to update this API",
            });
        }

        const allowedFields = [
            "name",
            "description",
            "baseUrl",
            "pathPrefix",
            "allowedMethods",
            "timeoutMs",
            "status",
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                apiConfiguration[field] = req.body[field];
            }
        }

        await apiConfiguration.save();

        return res.status(200).json({
            success: true,
            message: "API configuration updated successfully",
            data: apiConfiguration,
        });
    } catch (error) {
        next(error);
    }
};

// Delete API configuration
export const deleteApiConfiguration = async (req, res, next) => {
    try {
        const { apiId } = req.params;

        const apiConfiguration = await ApiConfiguration.findById(apiId);

        if (!apiConfiguration) {
            return res.status(404).json({
                success: false,
                message: "API configuration not found",
            });
        }

        const context = await getEnvironmentContext(
            apiConfiguration.environmentId,
            req.user.id
        );

        if (context.error) {
            const statusCode =
                context.error === "FORBIDDEN" ? 403 : 404;

            return res.status(statusCode).json({
                success: false,
                message: context.error,
            });
        }

        if (!context.canManage) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this API",
            });
        }

        await apiConfiguration.deleteOne();

        return res.status(200).json({
            success: true,
            message: "API configuration deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};