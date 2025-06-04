const express = require('express');
const router = express.Router();
const { createHash, createHmac } = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Verify Telegram WebApp data
const verifyTelegramWebAppData = (data) => {
  if (!data || !data.auth_date || !data.hash) {
    return false;
  }

  const botToken = process.env.BOT_TOKEN;
  const secretKey = createHash('sha256')
    .update(botToken)
    .digest();

  const dataCheckString = Object.keys(data)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');

  const hmac = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === data.hash;
};

// Login/Register with Telegram
router.post('/telegram', async (req, res, next) => {
  try {
    const initData = req.body.initData;
    if (!initData) {
      throw new Error('Missing Telegram init data');
    }

    const parsedData = Object.fromEntries(new URLSearchParams(initData));
    if (!verifyTelegramWebAppData(parsedData)) {
      throw new Error('Invalid Telegram init data');
    }

    const userData = JSON.parse(parsedData.user);
    
    // Find or create user
    let user = await User.findOne({ telegramId: userData.id });
    
    if (!user) {
      user = new User({
        telegramId: userData.id,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        language: userData.language_code === 'fa' ? 'fa' : 'en'
      });
      await user.save();
    } else {
      // Update user data if changed
      user.username = userData.username;
      user.firstName = userData.first_name;
      user.lastName = userData.last_name;
      user.lastActive = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
        role: user.role,
        credits: user.credits,
        settings: user.settings,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin login
router.post('/admin', async (req, res, next) => {
  try {
    const { telegramId } = req.body;
    
    if (!telegramId) {
      throw new Error('Telegram ID is required');
    }

    const adminIds = JSON.parse(process.env.ADMIN_TELEGRAM_IDS || '[]');
    if (!adminIds.includes(telegramId.toString())) {
      const error = new Error('Unauthorized');
      error.name = 'UnauthorizedError';
      throw error;
    }

    const user = await User.findOne({ telegramId });
    if (!user) {
      throw new Error('Admin user not found');
    }

    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error('Not authenticated');
      error.name = 'UnauthorizedError';
      throw error;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
        role: user.role,
        credits: user.credits,
        settings: user.settings,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user settings
router.patch('/settings', async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error('Not authenticated');
      error.name = 'UnauthorizedError';
      throw error;
    }

    const { notifications, theme, language } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    if (notifications !== undefined) {
      user.settings.notifications = notifications;
    }
    if (theme) {
      user.settings.theme = theme;
    }
    if (language) {
      user.language = language;
    }

    await user.save();

    res.json({
      settings: user.settings,
      language: user.language
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 