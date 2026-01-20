const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  username: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String
  },
  votingPower: {
    type: String,
    default: '0'
  },
  delegatedTo: {
    type: String,
    lowercase: true
  },
  delegatedFrom: [{
    type: String,
    lowercase: true
  }],
  proposalsCreated: {
    type: Number,
    default: 0
  },
  votesCount: {
    type: Number,
    default: 0
  },
  lockedTokens: {
    type: String,
    default: '0'
  },
  lockEnd: {
    type: Date
  },
  roles: [{
    type: String,
    enum: ['Admin', 'Moderator', 'Member']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ votingPower: -1 });
UserSchema.index({ proposalsCreated: -1 });
UserSchema.index({ votesCount: -1 });

module.exports = mongoose.model('User', UserSchema);
