const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    sparse: true,
    index: true
  },
  firstName: String,
  lastName: String,
  language: {
    type: String,
    enum: ['en', 'fa'],
    default: 'en'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user'
  },
  credits: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  statistics: {
    totalGenerations: {
      type: Number,
      default: 0
    },
    successfulPayments: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'business'],
      default: 'free'
    },
    expiresAt: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Only add indexes that aren't already defined in the schema
userSchema.index({ 'subscription.expiresAt': 1 });

// Methods
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

userSchema.methods.addCredits = function(amount) {
  this.credits += amount;
  return this.save();
};

userSchema.methods.deductCredits = function(amount) {
  if (this.credits < amount) {
    throw new Error('Insufficient credits');
  }
  this.credits -= amount;
  return this.save();
};

userSchema.methods.updateStatistics = function(type, value = 1) {
  if (type === 'generations') {
    this.statistics.totalGenerations += value;
  } else if (type === 'payments') {
    this.statistics.successfulPayments += value;
  } else if (type === 'spent') {
    this.statistics.totalSpent += value;
  }
  return this.save();
};

// Statics
userSchema.statics.findByTelegramId = function(telegramId) {
  return this.findOne({ telegramId });
};

userSchema.statics.findActiveSubscribers = function() {
  return this.find({
    'subscription.type': { $ne: 'free' },
    'subscription.expiresAt': { $gt: new Date() }
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 