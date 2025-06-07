import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './utils/database';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import namesRoutes from './routes/names';
import paymentsRoutes from './routes/payments';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectToDatabase().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 