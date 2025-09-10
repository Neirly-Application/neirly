const mongoose = require('mongoose');

const ApikeySchema = new mongoose.Schema({
  key:         { type: String, required: true, unique: true },
  hashedKey:   { type: String, required: true, unique: true },
  description: { type: String, required: true },
  owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['active', 'revoked'], default: 'active' },
  permissions: { type: [String], default: ['read:profile'] },
  createdAt:   { type: Date, default: Date.now },
  lastUsedAt:  { type: Date, default: null },

  usageLog: [{
    ip:        { type: String },
    userAgent: { type: String },
    date:      { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Apikey', ApikeySchema);
