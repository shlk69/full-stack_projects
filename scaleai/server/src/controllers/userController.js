import User from '../models/User.js';

export const getBrandVoice = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                success: true,
                brandVoice: user.brandVoice,
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBrandVoice = async (req, res) => {
    try {
        const { tone, guidelines, samplePosts } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            if (tone !== undefined) user.brandVoice.tone = tone;
            if (guidelines !== undefined) user.brandVoice.guidelines = guidelines;
            if (samplePosts !== undefined) user.brandVoice.samplePosts = samplePosts;

            const updatedUser = await user.save();
            res.json({
                success: true,
                brandVoice: updatedUser.brandVoice,
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
