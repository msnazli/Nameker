import mongoose from 'mongoose';
import { User, Name, Payment } from '@nameker/shared';

const userSchema = new mongoose.Schema<User>({
  telegramId: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const nameSchema = new mongoose.Schema<Name>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema<Payment>({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<User>('User', userSchema);
export const NameModel = mongoose.model<Name>('Name', nameSchema);
export const PaymentModel = mongoose.model<Payment>('Payment', paymentSchema);

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export function disconnectFromDatabase() {
  return mongoose.disconnect();
} 