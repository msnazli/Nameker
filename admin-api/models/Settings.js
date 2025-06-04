const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: mongoose.Schema.Types.Mixed,
  category: {
    type: String,
    required: true,
    enum: ['pricing', 'features', 'api', 'ui', 'system']
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Only add indexes that aren't already defined in the schema
settingsSchema.index({ category: 1 });

// Default settings
const defaultSettings = {
  // Pricing settings
  'pricing.basic': {
    value: {
      credits: 100,
      price: {
        IRR: 500000,
        TON: 5,
        USD: 10
      },
      features: ['basic_generation', 'basic_features']
    },
    category: 'pricing',
    description: 'Basic package pricing configuration',
    isPublic: true
  },
  'pricing.pro': {
    value: {
      credits: 500,
      price: {
        IRR: 2000000,
        TON: 20,
        USD: 40
      },
      features: ['pro_generation', 'all_features', 'priority_support']
    },
    category: 'pricing',
    description: 'Pro package pricing configuration',
    isPublic: true
  },
  
  // Feature settings
  'features.available': {
    value: [
      'modern',
      'classic',
      'creative',
      'professional',
      'tech',
      'friendly'
    ],
    category: 'features',
    description: 'Available name generation features',
    isPublic: true
  },
  'features.styles': {
    value: [
      'minimal',
      'elegant',
      'bold',
      'playful',
      'corporate',
      'innovative'
    ],
    category: 'features',
    description: 'Available name styles',
    isPublic: true
  },
  
  // API settings
  'api.openai.model': {
    value: 'gpt-4',
    category: 'api',
    description: 'OpenAI model configuration',
    isPublic: false
  },
  'api.openai.temperature': {
    value: 0.7,
    category: 'api',
    description: 'OpenAI temperature setting',
    isPublic: false
  },
  
  // UI settings
  'ui.languages': {
    value: ['en', 'fa'],
    category: 'ui',
    description: 'Available UI languages',
    isPublic: true
  },
  'ui.theme': {
    value: {
      light: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#FFFFFF'
      },
      dark: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        background: '#000000'
      }
    },
    category: 'ui',
    description: 'UI theme configuration',
    isPublic: true
  },
  
  // System settings
  'system.maintenance': {
    value: false,
    category: 'system',
    description: 'System maintenance mode',
    isPublic: true
  },
  'system.version': {
    value: '1.0.0',
    category: 'system',
    description: 'System version',
    isPublic: true
  }
};

// Methods
settingsSchema.statics.getByKey = function(key) {
  return this.findOne({ key });
};

settingsSchema.statics.getPublic = function() {
  return this.find({ isPublic: true });
};

settingsSchema.statics.getByCategory = function(category) {
  return this.find({ category });
};

settingsSchema.statics.updateByKey = async function(key, value, userId) {
  return this.findOneAndUpdate(
    { key },
    { 
      $set: { 
        value,
        lastModifiedBy: userId
      }
    },
    { new: true }
  );
};

settingsSchema.statics.initializeDefaults = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const [key, settings] of Object.entries(defaultSettings)) {
      await this.findOneAndUpdate(
        { key },
        { $setOnInsert: { key, ...settings } },
        { upsert: true, session }
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 