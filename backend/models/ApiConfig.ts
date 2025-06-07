import mongoose from 'mongoose';

interface IApiConfig {
  name: string;
  key: string;
  endpoint: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiConfigModel extends mongoose.Model<IApiConfig> {
  // Add any static methods here if needed
}

const apiConfigSchema = new mongoose.Schema<IApiConfig, ApiConfigModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      // The key will be stored encrypted
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add any instance methods here if needed
// apiConfigSchema.methods.someMethod = function() { ... };

// Add any static methods here if needed
// apiConfigSchema.statics.someStaticMethod = function() { ... };

// Add any middleware here if needed
apiConfigSchema.pre('save', function(next) {
  // You can add pre-save validation or modification here
  next();
});

export const ApiConfig = mongoose.model<IApiConfig, ApiConfigModel>('ApiConfig', apiConfigSchema); 