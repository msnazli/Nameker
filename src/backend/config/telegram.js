const { Telegraf } = require('telegraf');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const createBot = () => {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error('BOT_TOKEN must be provided!');
  }

  // Create bot instance with minimal configuration
  const bot = new Telegraf(token, {
    telegram: {
      apiRoot: 'https://api.telegram.org'
    }
  });

  // Add error handling
  bot.catch((err) => {
    logger.error('Telegram bot error:', err);
  });

  return bot;
};

const initBot = async () => {
  try {
    const bot = createBot();

    // Add bot commands
    bot.command('start', (ctx) => {
      ctx.reply('Welcome to Nameker! Click the button below to open the app.', {
        reply_markup: {
          inline_keyboard: [[
            { text: 'Open App', web_app: { url: process.env.MINIAPP_URL } }
          ]]
        }
      });
    });

    // Launch bot with specific configuration
    await bot.launch({
      allowedUpdates: ['message', 'callback_query'],
      dropPendingUpdates: true
    });

    logger.info('Telegram bot started successfully');
    return bot;
  } catch (error) {
    logger.error('Failed to initialize Telegram bot:', error);
    throw error;
  }
};

module.exports = {
  initBot,
  createBot
}; 