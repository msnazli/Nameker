import { Router } from 'express';
import { PaymentModel } from '@nameker/database';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get all payments for a user
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const payments = await PaymentModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    return res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new payment
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Missing amount' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const payment = await PaymentModel.create({
      userId: req.user.id,
      amount,
      status: 'pending'
    });

    // TODO: Implement payment gateway integration
    // This is where you would integrate with Zarinpal or TON

    return res.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update payment status (webhook endpoint)
router.post('/webhook', async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const payment = await PaymentModel.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 