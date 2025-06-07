import { Router } from 'express';
import { NameModel } from '@nameker/database';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get all names for a user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const names = await NameModel.find({ userId: req.user?.id })
      .sort({ createdAt: -1 });
    return res.json(names);
  } catch (error) {
    console.error('Error fetching names:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate a new name
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Missing prompt' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // TODO: Implement OpenAI integration for name generation
    const generatedName = 'Sample Name'; // Replace with actual AI generation
    const generatedDescription = 'Sample Description'; // Replace with actual AI generation

    const name = await NameModel.create({
      userId: req.user.id,
      name: generatedName,
      description: generatedDescription
    });

    return res.json(name);
  } catch (error) {
    console.error('Error generating name:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a name
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const name = await NameModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!name) {
      return res.status(404).json({ message: 'Name not found' });
    }

    return res.json({ message: 'Name deleted successfully' });
  } catch (error) {
    console.error('Error deleting name:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 