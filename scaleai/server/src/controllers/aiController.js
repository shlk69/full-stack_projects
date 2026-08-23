import ContentSource from '../models/ContentSource.js';
import RepurposedPost from '../models/RepurposedPost.js';
import User from '../models/User.js';
import { generateContent } from '../services/openaiService.js';

export const generatePosts = async (req, res) => {
    try {
        const { sourceId } = req.body;

        const source = await ContentSource.findById(sourceId);
        if (!source || source.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Source not found or unauthorized' });
        }

        const user = await User.findById(req.user._id);

        const generated = await generateContent(source.rawContent, user.brandVoice);

        await RepurposedPost.deleteMany({ sourceId, status: 'DRAFT', userId: req.user._id });

        const postsToCreate = [
            {
                userId: req.user._id,
                sourceId,
                platform: 'LINKEDIN',
                content: generated.linkedin,
                status: 'DRAFT',
            },
            {
                userId: req.user._id,
                sourceId,
                platform: 'TWITTER_THREAD',
                content: generated.twitterThread,
                status: 'DRAFT',
            },
            {
                userId: req.user._id,
                sourceId,
                platform: 'NEWSLETTER',
                content: generated.newsletter,
                status: 'DRAFT',
            },
        ];

        const posts = await RepurposedPost.insertMany(postsToCreate);

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
