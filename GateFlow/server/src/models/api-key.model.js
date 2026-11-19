
import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        keyPrefix: {
            type: String,
            required: true,
            trim: true,
        },

        keyHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },

        environmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Environment",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "revoked"],
            default: "active",
        },

        lastUsedAt: {
            type: Date,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        replacedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApiKey",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

apiKeySchema.index({ environmentId: 1, createdAt: -1 });
apiKeySchema.index({ environmentId: 1, status: 1 });

export const ApiKey = mongoose.model("ApiKey", apiKeySchema);
