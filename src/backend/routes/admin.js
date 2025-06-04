const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Name = require('../models/Name');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

// All routes require admin authentication
router.use(authenticateAdmin);

// Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Get user stats
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      registrationDate: { $gte: thirtyDaysAgo }
    });
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo }
    });

    // Get name generation stats
    const totalNames = await Name.countDocuments();
    const nameStats = await Name.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalGenerated: { $sum: 1 },
          averageGenerationTime: { $avg: '$generationTime' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'generated'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get payment stats
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers
      },
      names: {
        total: totalNames,
        ...nameStats[0]
      },
      payments: paymentStats
    });
  } catch (error) {
    next(error);
  }
});

// User management
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { telegramId: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.patch('/users/:id', async (req, res, next) => {
  try {
    const {
      role,
      credits,
      isActive,
      subscription
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (role) user.role = role;
    if (credits !== undefined) user.credits = credits;
    if (isActive !== undefined) user.isActive = isActive;
    if (subscription) user.subscription = subscription;

    await user.save();

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Settings management
router.get('/settings', async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const settings = category
      ? await Settings.getByCategory(category)
      : await Settings.find();

    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

router.patch('/settings/:key', async (req, res, next) => {
  try {
    const { value } = req.body;

    const setting = await Settings.updateByKey(
      req.params.key,
      value,
      req.user.id
    );

    if (!setting) {
      const error = new Error('Setting not found');
      error.name = 'NotFoundError';
      throw error;
    }

    res.json({ setting });
  } catch (error) {
    next(error);
  }
});

// Name management
router.get('/names', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const names = await Name.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username telegramId');

    const total = await Name.countDocuments(query);

    res.json({
      names,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Payment management
router.get('/payments', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username telegramId');

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Process refund
router.post('/payments/:id/refund', async (req, res, next) => {
  try {
    const { reason, amount } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      const error = new Error('Payment not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    await payment.refund(reason, amount, req.user.id);

    // Deduct credits from user
    const user = await User.findById(payment.userId);
    await user.deductCredits(payment.credits);

    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 