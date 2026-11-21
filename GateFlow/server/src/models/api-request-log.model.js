
import mongoose from "mongoose";

const apiRequestLogSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            required: true,
            index: true,
        },

        environmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Environment",
            default: null,
        },

        apiKeyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApiKey",
            default: null,
        },

        apiConfigurationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApiConfiguration",
            default: null,
        },

        method: {
            type: String,
            required: true,
        },

        path: {
            type: String,
            required: true,
        },

        statusCode: {
            type: Number,
            required: true,
        },

        durationMs: {
            type: Number,
            required: true,
            min: 0,
        },

        responseSize: {
            type: Number,
            default: 0,
            min: 0,
        },

        clientAborted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

apiRequestLogSchema.index({ environmentId: 1, createdAt: -1 });
apiRequestLogSchema.index({ apiKeyId: 1, createdAt: -1 });
apiRequestLogSchema.index({ statusCode: 1, createdAt: -1 });

export const ApiRequestLog = mongoose.model(
    "ApiRequestLog",
    apiRequestLogSchema
);
