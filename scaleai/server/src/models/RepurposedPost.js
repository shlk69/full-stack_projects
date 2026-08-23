import mongoose from 'mongoose';

const repurposedPostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ContentSource',
            required: true,
            index: true
        },
        platform: {
            type: String,
            enum: ['LINKEDIN', 'TWITTER_THREAD', 'NEWSLETTER'],
            required: true
        },
        // Content is Mixed: String for LINKEDIN/NEWSLETTER, Array of Strings for TWITTER_THREAD
        content: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        status: {
            type: String,
            enum: ['DRAFT', 'SCHEDULED', 'PUBLISHED'],
            default: 'DRAFT',
            index: true
        },
        scheduledFor: {
            type: Date,
            default: null,
            index: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('RepurposedPost', repurposedPostSchema);
