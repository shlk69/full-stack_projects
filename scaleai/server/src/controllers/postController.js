import RepurposedPost from '../models/RepurposedPost.js';

export const getPosts = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        const query = { userId: req.user._id };

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.scheduledFor = {};
            if (startDate) query.scheduledFor.$gte = new Date(startDate);
            if (endDate) query.scheduledFor.$lte = new Date(endDate);
        }

        const posts = await RepurposedPost.find(query).populate('sourceId', 'title').sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { content, status } = req.body;

        const post = await RepurposedPost.findById(req.params.id);
        if (!post || post.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (content !== undefined) post.content = content;
        if (status !== undefined) post.status = status;

        const updatedPost = await post.save();
        res.json({ success: true, post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const schedulePost = async (req, res) => {
    try {
        const { scheduledFor } = req.body;

        const post = await RepurposedPost.findById(req.params.id);
        if (!post || post.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post.scheduledFor = new Date(scheduledFor);
        post.status = 'SCHEDULED';

        const updatedPost = await post.save();
        res.json({ success: true, post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
