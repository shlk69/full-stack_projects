import ContentSource from '../models/ContentSource.js';
import RepurposedPost from '../models/RepurposedPost.js';

export const createSource = async (req, res) => {
    try {
        const { title, rawContent, sourceType } = req.body;

        const source = await ContentSource.create({
            userId: req.user._id,
            title,
            rawContent,
            sourceType,
            characterCount: rawContent.length,
        });

        res.status(201).json({ success: true, source });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSources = async (req, res) => {
    try {
        const sources = await ContentSource.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, sources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSource = async (req, res) => {
    try {
        const source = await ContentSource.findById(req.params.id);

        if (source) {
            if (source.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }

            await ContentSource.deleteOne({ _id: source._id });
            await RepurposedPost.deleteMany({ sourceId: source._id });

            res.json({ success: true, message: 'Source and associated posts deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Source not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
