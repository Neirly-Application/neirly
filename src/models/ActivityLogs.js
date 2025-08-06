const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

ActivityLogSchema.index({ userId: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
