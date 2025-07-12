const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  birthdate: { type: Date },
  join_date: { type: Date, default: Date.now },
  wantsUpdates:  { type: Boolean, default: false },
  forceLogout: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  forceLogout: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profilePictureUrl: { type: String, default: '/media/user.png' },
  acceptedTerms: {
  type: Boolean,
        required: function () {
            return this.profileCompleted;
        }
    },
  discordId: String,
  passwordHash: {
    type: String,
  },
  provider: { 
  type: String, 
  enum: ['local', 'google', 'discord'], 
  default: 'local' 
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  roles: {    
    type: [String],
    enum: ['user', 'supporter','moderator', 'ceo' ],
    default: ['user']
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;