const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['IRR', 'TON', 'USD'],
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  gateway: {
    type: String,
    enum: ['zarinpal', 'ton', 'manual'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    sparse: true
  },
  gatewayResponse: {
    authority: String,
    refId: String,
    cardHash: String,
    cardPan: String
  },
  metadata: {
    package: {
      type: String,
      enum: ['basic', 'pro', 'business']
    },
    description: String,
    promoCode: String,
    discount: Number
  },
  error: {
    code: String,
    message: String,
    timestamp: Date
  },
  refund: {
    date: Date,
    reason: String,
    amount: Number,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'metadata.promoCode': 1 });

// Methods
paymentSchema.methods.complete = function(transactionData) {
  this.status = 'completed';
  this.transactionId = transactionData.transactionId;
  this.gatewayResponse = {
    authority: transactionData.authority,
    refId: transactionData.refId,
    cardHash: transactionData.cardHash,
    cardPan: transactionData.cardPan
  };
  return this.save();
};

paymentSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.error = {
    code: error.code,
    message: error.message,
    timestamp: new Date()
  };
  return this.save();
};

paymentSchema.methods.processRefund = function(reason, amount, adminId) {
  this.status = 'refunded';
  this.refund = {
    date: new Date(),
    reason: reason,
    amount: amount || this.amount,
    processedBy: adminId
  };
  return this.save();
};

// Statics
paymentSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 });
};

paymentSchema.statics.findPending = function() {
  return this.find({ 
    status: 'pending',
    createdAt: { 
      $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    }
  });
};

paymentSchema.statics.getStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$currency',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

paymentSchema.statics.getDailyStats = function(days = 30) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          currency: '$currency'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 