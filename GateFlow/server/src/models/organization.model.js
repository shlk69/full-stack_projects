import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'developer', 'viewer'],
            default: 'viewer',
            required: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false } // Prevents creating separate subdocument IDs for each member entry
);

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Organization owner is required'],
        },
        members: {
            type: [memberSchema],
            default: [],
        },
        status: {
            type: String,
            enum: ['active', 'disabled'],
            default: 'active',
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt fields
    }
);

// Index for faster lookups by slug and member userId
organizationSchema.index({ slug: 1 });
organizationSchema.index({ 'members.userId': 1 });

export const Organization = mongoose.model('Organization', organizationSchema);
