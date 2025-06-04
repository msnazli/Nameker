const jwt = require('jsonwebtoken');
const { createHash, createHmac } = require('crypto');

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

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Check for JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    // Check for Telegram WebApp data
    const initData = req.headers['x-telegram-init-data'];
    if (initData) {
      const parsedData = Object.fromEntries(new URLSearchParams(initData));
      if (verifyTelegramWebAppData(parsedData)) {
        req.user = {
          id: parsedData.user?.id,
          username: parsedData.user?.username,
          first_name: parsedData.user?.first_name,
          last_name: parsedData.user?.last_name,
          isTelegramUser: true
        };
        return next();
      }
    }

    throw new Error('Invalid or missing authentication');
  } catch (error) {
    error.name = 'UnauthorizedError';
    next(error);
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticate(req, res, () => {
      const adminIds = JSON.parse(process.env.ADMIN_TELEGRAM_IDS || '[]');
      if (!adminIds.includes(req.user.id?.toString())) {
        const error = new Error('Admin access required');
        error.name = 'ForbiddenError';
        throw error;
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isTelegramUser: user.isTelegramUser
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

module.exports = {
  authenticate,
  authenticateAdmin,
  generateToken,
  verifyTelegramWebAppData
}; 