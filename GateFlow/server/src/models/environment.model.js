import mongoose from "mongoose";

const environmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 300,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        type: {
            type: String,
            enum: ["development", "staging", "production"],
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "disabled"],
            default: "active",
        },

        baseUrl: {
            type: String,
            trim: true,
            default: "",
        },

        rateLimit: {
            maxRequests: {
                type: Number,
                default: 100,
                min: 1,
            },

            windowSeconds: {
                type: Number,
                default: 60,
                min: 1,
            },
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Environment slug must be unique within a project.
environmentSchema.index(
    { projectId: 1, slug: 1 },
    { unique: true }
);

// Prevent duplicate environment types in a project.
environmentSchema.index(
    { projectId: 1, type: 1 },
    { unique: true }
);

export const Environment = mongoose.model(
    "Environment",
    environmentSchema
);