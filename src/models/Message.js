const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  deletedBySender: { type: Boolean, default: false },
  deletedByRecipient: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
    default: 'text',
    required: true
  },
  content: { 
    type: String, 
    required: function () { return this.type === 'text'; } 
  },
  attachments: [{ type: String }],  
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  reactions: [{
    emoji: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  readByRecipient: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  isSystem: { type: Boolean, default: false }
});

MessageSchema.index({ sender: 1, recipient: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);
