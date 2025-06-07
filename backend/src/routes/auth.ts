import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '@nameker/database';

const router = Router();

router.post('/telegram-auth', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName } = req.body;

    if (!telegramId || !username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await UserModel.findOne({ telegramId });

    if (!user) {
      user = await UserModel.create({
        telegramId,
        username,
        firstName,
        lastName
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user.id, telegramId: user.telegramId },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 