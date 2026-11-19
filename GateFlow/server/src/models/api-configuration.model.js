import mongoose from "mongoose";

const apiConfigurationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
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

        baseUrl: {
            type: String,
            required: true,
            trim: true,
        },

        pathPrefix: {
            type: String,
            required: true,
            trim: true,
            default: "/",
        },

        allowedMethods: {
            type: [String],
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            default: ["GET"],
            required: true,
        },

        timeoutMs: {
            type: Number,
            default: 10000,
            min: 1000,
            max: 60000,
        },

        status: {
            type: String,
            enum: ["active", "disabled"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

apiConfigurationSchema.index({
    environmentId: 1,
    createdAt: -1,
});

apiConfigurationSchema.index({
    environmentId: 1,
    name: 1,
});

export const ApiConfiguration = mongoose.model(
    "ApiConfiguration",
    apiConfigurationSchema
);