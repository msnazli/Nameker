require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const rateLimit = require('rate-limiter-flexible');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const nameRoutes = require('./routes/names');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

// Import middleware and config
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { initBot } = require('./config/telegram');

// Initialize Express app
const app = express();

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.telegram.org"],
      scriptSrc: ["'self'", "https://telegram.org", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", "https://telegram.org"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.MINIAPP_URL, process.env.ADMIN_URL] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = new rateLimit.RateLimiterMemory({
  points: process.env.NODE_ENV === 'production' ? 100 : 1000,
  duration: 60
});

app.use(async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/names', authenticate, nameRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/api/payment', authenticate, paymentRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../miniapp/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../miniapp/dist/index.html'));
  });
}

// Error handling
app.use(errorHandler);

// MongoDB connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      logger.info('Connected to MongoDB');
      startServer();
    })
    .catch((err) => {
      logger.error('MongoDB connection error:', err);
      logger.info('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

// Server startup
const startServer = () => {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Initialize Telegram bot after server starts
    initBot().catch(error => {
      logger.error('Failed to initialize Telegram bot:', error);
    });
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
      mongoose.disconnect()
        .then(() => {
          logger.info('MongoDB disconnected');
          process.exit(0);
        })
        .catch(err => {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Start the application
connectWithRetry();
