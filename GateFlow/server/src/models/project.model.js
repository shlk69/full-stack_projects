import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },

        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
        },
    },
    { timestamps: true }
);

projectSchema.index(
    { organizationId: 1, slug: 1 },
    { unique: true }
);

export const Project = mongoose.model("Project", projectSchema);