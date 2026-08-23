import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required']
        },
        brandVoice: {
            tone: {
                type: String,
                default: 'Professional, direct, and authoritative'
            },
            guidelines: {
                type: String,
                default: 'Use active voice. Avoid corporate jargon. Keep paragraphs short (1-3 sentences).'
            },
            samplePosts: [
                {
                    type: String,
                    trim: true
                }
            ]
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('User', userSchema);
