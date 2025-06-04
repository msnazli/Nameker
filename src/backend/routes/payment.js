const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const { authenticate } = require('../middleware/auth');

// Initialize Zarinpal
const ZARINPAL_API = 'https://api.zarinpal.com/pg/v4/payment';
const ZARINPAL_VERIFY_API = 'https://api.zarinpal.com/pg/v4/payment/verify';

// Get available packages
router.get('/packages', authenticate, async (req, res, next) => {
  try {
    const basicPackage = await Settings.getByKey('pricing.basic');
    const proPackage = await Settings.getByKey('pricing.pro');

    res.json({
      packages: [basicPackage.value, proPackage.value]
    });
  } catch (error) {
    next(error);
  }
});

// Create Zarinpal payment
router.post('/zarinpal/create', authenticate, async (req, res, next) => {
  try {
    const { package: packageType, currency = 'IRR' } = req.body;

    // Get package details
    const packageSetting = await Settings.getByKey(`pricing.${packageType}`);
    if (!packageSetting) {
      throw new Error('Invalid package type');
    }

    const amount = packageSetting.value.price[currency];
    const credits = packageSetting.value.credits;

    // Create payment record
    const payment = new Payment({
      userId: req.user.id,
      amount,
      currency,
      credits,
      gateway: 'zarinpal',
      metadata: {
        package: packageType,
        description: `${credits} credits package purchase`
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await payment.save();

    // Request payment from Zarinpal
    const response = await axios.post(ZARINPAL_API, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount,
      callback_url: `${process.env.BACKEND_URL}/api/payment/zarinpal/verify`,
      description: payment.metadata.description,
      metadata: {
        payment_id: payment._id.toString(),
        user_id: req.user.id
      }
    });

    if (response.data.data.code === 100) {
      res.json({
        authority: response.data.data.authority,
        gatewayUrl: `https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`
      });
    } else {
      throw new Error('Payment creation failed');
    }
  } catch (error) {
    next(error);
  }
});

// Verify Zarinpal payment
router.get('/zarinpal/verify', async (req, res, next) => {
  try {
    const { Authority, Status } = req.query;

    if (Status !== 'OK') {
      return res.redirect(`${process.env.MINIAPP_URL}/payment/failed`);
    }

    // Find payment
    const payment = await Payment.findOne({
      'gatewayResponse.authority': Authority,
      status: 'pending'
    });

    if (!payment) {
      return res.redirect(`${process.env.MINIAPP_URL}/payment/failed`);
    }

    // Verify with Zarinpal
    const response = await axios.post(ZARINPAL_VERIFY_API, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: payment.amount,
      authority: Authority
    });

    if (response.data.data.code === 100) {
      // Update payment
      await payment.complete({
        transactionId: response.data.data.ref_id,
        authority: Authority,
        cardHash: response.data.data.card_hash,
        cardPan: response.data.data.card_pan
      });

      // Update user credits
      const user = await User.findById(payment.userId);
      await user.addCredits(payment.credits);
      await user.updateStatistics('payments');
      await user.updateStatistics('spent', payment.amount);

      return res.redirect(`${process.env.MINIAPP_URL}/payment/success`);
    } else {
      await payment.fail({
        code: response.data.data.code,
        message: response.data.data.message
      });
      return res.redirect(`${process.env.MINIAPP_URL}/payment/failed`);
    }
  } catch (error) {
    next(error);
  }
});

// Create TON payment
router.post('/ton/create', authenticate, async (req, res, next) => {
  try {
    const { package: packageType } = req.body;

    // Get package details
    const packageSetting = await Settings.getByKey(`pricing.${packageType}`);
    if (!packageSetting) {
      throw new Error('Invalid package type');
    }

    const amount = packageSetting.value.price.TON;
    const credits = packageSetting.value.credits;

    // Create payment record
    const payment = new Payment({
      userId: req.user.id,
      amount,
      currency: 'TON',
      credits,
      gateway: 'ton',
      metadata: {
        package: packageType,
        description: `${credits} credits package purchase`
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await payment.save();

    // Generate TON payment link
    const tonPaymentUrl = `ton://transfer/${process.env.TON_WALLET_ADDRESS}?amount=${amount * 1000000000}&text=payment_id:${payment._id}`;

    res.json({
      paymentId: payment._id,
      amount,
      tonPaymentUrl
    });
  } catch (error) {
    next(error);
  }
});

// Verify TON payment
router.post('/ton/verify', authenticate, async (req, res, next) => {
  try {
    const { paymentId, transactionHash } = req.body;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user.id,
      status: 'pending'
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // TODO: Verify transaction on TON blockchain
    // This is a placeholder for actual TON blockchain verification
    const isValid = true;

    if (isValid) {
      // Update payment
      await payment.complete({
        transactionId: transactionHash
      });

      // Update user credits
      const user = await User.findById(payment.userId);
      await user.addCredits(payment.credits);
      await user.updateStatistics('payments');
      await user.updateStatistics('spent', payment.amount);

      res.json({
        success: true,
        credits: user.credits
      });
    } else {
      await payment.fail({
        code: 'INVALID_TRANSACTION',
        message: 'Transaction verification failed'
      });
      throw new Error('Transaction verification failed');
    }
  } catch (error) {
    next(error);
  }
});

// Get user's payment history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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

module.exports = router; 