import mongoose from 'mongoose';

const contentSourceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        rawContent: {
            type: String,
            required: [true, 'Raw content string is required']
        },
        sourceType: {
            type: String,
            enum: ['BLOG', 'TRANSCRIPT', 'RAW_NOTES'],
            default: 'BLOG'
        },
        characterCount: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('ContentSource', contentSourceSchema);
