const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

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
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],

  readByRecipient: { type: Boolean, default: false },

  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },

  timestamp: { type: Date, default: Date.now }
});

MessageSchema.index({ sender: 1, recipient: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);
