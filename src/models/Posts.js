const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  reactions: { 
    faceSmile: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    faceGrinHearts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    faceGrinStars: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    faceCool: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    faceSadTear: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  media: {
    url: { type: String },
    type: { type: String, enum: ['image', 'video', 'gif'] }
  }
}, { timestamps: true });

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', PostSchema);
