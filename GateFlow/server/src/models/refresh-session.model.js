import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        familyId: {
            type: String,
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["active", "rotated", "revoked"],
            default: "active",
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        rotatedAt: {
            type: Date,
            default: null,
        },

        replacedByTokenHash: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

export const RefreshSession = mongoose.model(
    "RefreshSession",
    refreshSessionSchema
);