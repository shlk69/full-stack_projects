const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectWorkspaceSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'Untitled Workspace' },
    files: [
        {
            filePath: { type: String, required: true },
            language: { type: String, required: true },
            content: { type: String, required: true }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectWorkspace', projectWorkspaceSchema);
