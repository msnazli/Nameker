import mongoose from 'mongoose';

interface IFeature {
  name: {
    en: string;
    fa: string;
  };
  isActive: boolean;
  priority: number;
  type: 'feature' | 'style';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FeatureModel extends mongoose.Model<IFeature> {
  // Add any static methods here if needed
}

const featureSchema = new mongoose.Schema<IFeature, FeatureModel>(
  {
    name: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      fa: {
        type: String,
        required: true,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['feature', 'style'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
featureSchema.index({ type: 1, priority: -1 });
featureSchema.index({ isActive: 1 });

// Add any instance methods here if needed
// featureSchema.methods.someMethod = function() { ... };

// Add any static methods here if needed
// featureSchema.statics.someStaticMethod = function() { ... };

// Add any middleware here if needed
featureSchema.pre('save', function(next) {
  // You can add pre-save validation or modification here
  next();
});

export const Feature = mongoose.model<IFeature, FeatureModel>('Feature', featureSchema); 