const mongoose = require('mongoose');
const schema = new mongoose.Schema({ ride: { type: mongoose.Schema.Types.ObjectId, ref: 'ride', required: true }, sender: { type: mongoose.Schema.Types.ObjectId, required: true }, role: { type: String, enum: ['user', 'captain'], required: true }, text: { type: String, required: true, maxlength: 1000 }, clientId: { type: String, required: true, maxlength: 100 } }, { timestamps: true });
schema.index({ ride: 1, sender: 1, clientId: 1 }, { unique: true });
schema.index({ ride: 1, createdAt: -1 });
schema.index({ sender: 1, createdAt: -1 });
module.exports = mongoose.model('message', schema);
