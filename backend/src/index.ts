import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from './utils/database';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import namesRoutes from './routes/names';
import paymentsRoutes from './routes/payments';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'backend' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/names', authMiddleware, namesRoutes);
app.use('/payments', authMiddleware, paymentsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Nameker Admin API' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nameker')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 