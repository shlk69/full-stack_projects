
import crypto from "crypto";

import { ApiKey } from "../models/api-key.model.js";
import { Environment } from "../models/environment.model.js";
import { Project } from "../models/project.model.js";
import { Organization } from "../models/organization.model.js";

// Generate a secure API key
const generateApiKey = () => {
    const secret = crypto.randomBytes(32).toString("hex");

    const rawKey = `gf_live_${secret}`;

    const keyPrefix = rawKey.slice(0, 16);

    const keyHash = crypto
        .createHash("sha256")
        .update(rawKey)
        .digest("hex");

    return {
        rawKey,
        keyPrefix,
        keyHash,
    };
};

// Check environment access and permissions
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

// Shared permission response
const handleContextError = (context, res) => {
    if (!context.error) return false;

    const statusCode =
        context.error === "FORBIDDEN" ? 403 : 404;

    res.status(statusCode).json({
        success: false,
        message: context.error,
    });

    return true;
};

// Create API key
export const createApiKey = async (req, res, next) => {
    try {
        const { environmentId } = req.params;
        const { name, expiresAt } = req.body;

        const context = await getEnvironmentContext(
            environmentId,
            req.user.id
        );

        if (handleContextError(context, res)) return;

        if (!context.canManage) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to create API keys",
            });
        }

        if (expiresAt && new Date(expiresAt) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expiration date must be in the future",
            });
        }

        const { rawKey, keyPrefix, keyHash } = generateApiKey();

        const apiKey = await ApiKey.create({
            name,
            keyPrefix,
            keyHash,
            environmentId,
            createdBy: req.user.id,
            expiresAt: expiresAt || null,
        });

        return res.status(201).json({
            success: true,
            message: "API key generated successfully. Save it now; it won't be shown again.",
            data: {
                id: apiKey._id,
                name: apiKey.name,
                key: rawKey,
                keyPrefix: apiKey.keyPrefix,
                environmentId: apiKey.environmentId,
                status: apiKey.status,
                expiresAt: apiKey.expiresAt,
                createdAt: apiKey.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// List API keys for an environment
export const getApiKeys = async (req, res, next) => {
    try {
        const { environmentId } = req.params;

        const context = await getEnvironmentContext(
            environmentId,
            req.user.id
        );

        if (handleContextError(context, res)) return;

        const apiKeys = await ApiKey.find({ environmentId })
            .select("-keyHash")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: apiKeys.length,
            data: apiKeys,
        });
    } catch (error) {
        next(error);
    }
};

// Get API key details
export const getApiKeyById = async (req, res, next) => {
    try {
        const { keyId } = req.params;

        const apiKey = await ApiKey.findById(keyId);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: "API key not found",
            });
        }

        const context = await getEnvironmentContext(
            apiKey.environmentId,
            req.user.id
        );

        if (handleContextError(context, res)) return;

        return res.status(200).json({
            success: true,
            data: apiKey,
        });
    } catch (error) {
        next(error);
    }
};

// Rotate API key
export const rotateApiKey = async (req, res, next) => {
    try {
        const { keyId } = req.params;

        const oldKey = await ApiKey.findById(keyId);

        if (!oldKey) {
            return res.status(404).json({
                success: false,
                message: "API key not found",
            });
        }

        const context = await getEnvironmentContext(
            oldKey.environmentId,
            req.user.id
        );

        if (handleContextError(context, res)) return;

        if (!context.canManage) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to rotate this key",
            });
        }

        if (oldKey.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Only active API keys can be rotated",
            });
        }

        if (oldKey.expiresAt && oldKey.expiresAt <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expired API keys cannot be rotated",
            });
        }

        const { rawKey, keyPrefix, keyHash } = generateApiKey();

        const newKey = await ApiKey.create({
            name: oldKey.name,
            keyPrefix,
            keyHash,
            environmentId: oldKey.environmentId,
            createdBy: req.user.id,
            expiresAt: oldKey.expiresAt,
        });

        // Revoke the old key only after replacement creation succeeds.
        oldKey.status = "revoked";
        oldKey.revokedAt = new Date();
        oldKey.replacedBy = newKey._id;

        await oldKey.save();

        return res.status(201).json({
            success: true,
            message: "API key rotated successfully. Save your new key now.",
            data: {
                id: newKey._id,
                name: newKey.name,
                key: rawKey,
                keyPrefix: newKey.keyPrefix,
                environmentId: newKey.environmentId,
                status: newKey.status,
                expiresAt: newKey.expiresAt,
                createdAt: newKey.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Revoke API key
export const revokeApiKey = async (req, res, next) => {
    try {
        const { keyId } = req.params;

        const apiKey = await ApiKey.findById(keyId);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: "API key not found",
            });
        }

        const context = await getEnvironmentContext(
            apiKey.environmentId,
            req.user.id
        );

        if (handleContextError(context, res)) return;

        if (!context.canManage) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to revoke this key",
            });
        }

        if (apiKey.status === "revoked") {
            return res.status(400).json({
                success: false,
                message: "API key is already revoked",
            });
        }

        apiKey.status = "revoked";
        apiKey.revokedAt = new Date();

        await apiKey.save();

        return res.status(200).json({
            success: true,
            message: "API key revoked successfully",
        });
    } catch (error) {
        next(error);
    }
};
