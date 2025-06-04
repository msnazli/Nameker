const mongoose = require('mongoose');

const nameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'fa'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  styles: [{
    type: String
  }],
  metadata: {
    topic: String,
    jobDescription: String,
    keywords: [String],
    aiModel: String,
    promptTokens: Number,
    completionTokens: Number
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'generated', 'failed'],
    default: 'pending'
  },
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  generationTime: {
    type: Number // in milliseconds
  },
  cost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
nameSchema.index({ userId: 1 });
nameSchema.index({ name: 'text', description: 'text' });
nameSchema.index({ category: 1 });
nameSchema.index({ 'metadata.keywords': 1 });
nameSchema.index({ createdAt: -1 });

// Methods
nameSchema.methods.updateRating = function(rating) {
  this.rating = rating;
  return this.save();
};

nameSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

nameSchema.methods.setPublic = function(isPublic) {
  this.isPublic = isPublic;
  return this.save();
};

// Statics
nameSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

nameSchema.statics.findPublic = function() {
  return this.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(50);
};

nameSchema.statics.findByCategory = function(category) {
  return this.find({ category })
    .sort({ createdAt: -1 });
};

nameSchema.statics.findFavorites = function(userId) {
  return this.find({ 
    userId,
    isFavorite: true 
  }).sort({ createdAt: -1 });
};

nameSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: null,
      totalNames: { $sum: 1 },
      averageRating: { $avg: '$rating' },
      totalCost: { $sum: '$cost' },
      averageGenerationTime: { $avg: '$generationTime' }
    }}
  ]);
};

const Name = mongoose.model('Name', nameSchema);

module.exports = Name; 