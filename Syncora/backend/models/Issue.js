const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], default: 'TODO' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
    dueDate: { type: Date },
    order: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            return ret;
        }
    }
});

// Indexes for searching / filtering
issueSchema.index({ project: 1, status: 1 });
issueSchema.index({ project: 1, assignee: 1 });
issueSchema.index({ project: 1, priority: 1 });

module.exports = mongoose.model('Issue', issueSchema);
