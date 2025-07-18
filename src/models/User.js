const { StringSelectMenuBuilder } = require('@discordjs/builders');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  uniquenick: {
    type: String,
    unique: true,
    match: /^[a-z0-9._]+$/,
    lowercase: true,
    trim: true
  },
  uniquenickChangedAt: { type: Date, default: null },
  birthdate: { type: Date },
  about_me: { type: String, default: "👋 Hello there! I'm a Neirly user!"},
  join_date: { type: Date, default: Date.now },
  wantsUpdates:  { type: Boolean, default: false },
  forceLogout: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  forceLogout: { type: Boolean, default: false },
  recentChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profilePictureUrl: { type: String, default: '/media/user.png' },
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
  bioLimit: { 
    type: Number, 
    default: 250 

  },
  roles: {    
    type: [String],
    enum: ['user', 'supporter','moderator', 'ceo' ],
    default: ['user']
  },
  profileVisibility: {
    type: String,
    enum: ['friends', 'everyone', 'private'],
    default: 'friends'
  },
  devices: [{
    name: String,
    location: String,
    lastActive: Date
  }],
  passwordHash: { type: String },
  provider: { type: String, enum: ['local', 'google', 'discord'], default: 'local' },
  profileCompleted: { type: Boolean, default: false },
  roles: { type: [String], enum: ['user', 'supporter', 'alpha_tester', 'moderator', 'ceo' ], default: ['user']},
  acceptedTerms: { type: Boolean,
                    required: function () {
                        return this.profileCompleted;
                    }
                  },
homeSettings: {
  address: {
    city: { type: String },
    country: { type: String },
    province: { type: String },
    street: { type: String },
    zipCode: { type: String },
    },
    pets: {
      hasPets: { type: Boolean, default: false },
      petTypes: [{ type: String }]
    },
  },
  coins: { type: Number, default: 100 },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
