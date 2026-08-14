const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    metadata: { type: mongoose.Schema.Types.Mixed },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            return ret;
        }
    }
});

module.exports = mongoose.model('Activity', activitySchema);
