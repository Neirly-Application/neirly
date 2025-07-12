const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'System' },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  imageUrl: { type: String, default: '../media/notification.png' },
  type: { type: String, default: 'generic' },
  meta: { type: Object, default: {} },
});

module.exports = mongoose.model('Notification', NotificationSchema);