const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const User = require('../models/User');
const Name = require('../models/Name');
const Settings = require('../models/Settings');

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate name
router.post('/generate', async (req, res, next) => {
  try {
    const {
      topic,
      jobDescription,
      keywords = [],
      features = [],
      styles = []
    } = req.body;

    // Validate input
    if (!topic && !jobDescription) {
      throw new Error('Either topic or job description is required');
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check credits
    if (user.credits < 1) {
      const error = new Error('Insufficient credits');
      error.name = 'PaymentError';
      throw error;
    }

    // Get AI settings
    const modelSetting = await Settings.getByKey('api.openai.model');
    const temperatureSetting = await Settings.getByKey('api.openai.temperature');

    // Construct prompt
    const prompt = `Generate a unique and professional name based on the following criteria:
${topic ? `Topic: ${topic}` : ''}
${jobDescription ? `Job Description: ${jobDescription}` : ''}
${keywords.length > 0 ? `Keywords: ${keywords.join(', ')}` : ''}
${features.length > 0 ? `Features to incorporate: ${features.join(', ')}` : ''}
${styles.length > 0 ? `Style preferences: ${styles.join(', ')}` : ''}

Please provide:
1. The name
2. A brief description/explanation
3. Why it works for the given context

Format the response as JSON with the following structure:
{
  "name": "Generated Name",
  "description": "Brief description",
  "explanation": "Why it works"
}`;

    // Create name record
    const nameRecord = new Name({
      userId: user._id,
      status: 'pending',
      language: user.language,
      category: topic || 'general',
      features,
      styles,
      metadata: {
        topic,
        jobDescription,
        keywords,
        aiModel: modelSetting.value
      }
    });

    // Generate name using OpenAI
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: modelSetting.value,
      messages: [
        {
          role: "system",
          content: "You are a creative and professional name generator. You will generate names based on the given criteria and return them in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: temperatureSetting.value,
      max_tokens: 500,
      n: 1
    });

    const generationTime = Date.now() - startTime;
    const result = JSON.parse(completion.choices[0].message.content.trim());

    // Update name record
    nameRecord.name = result.name;
    nameRecord.description = result.description;
    nameRecord.metadata.explanation = result.explanation;
    nameRecord.status = 'generated';
    nameRecord.generationTime = generationTime;
    nameRecord.metadata.promptTokens = completion.usage.prompt_tokens;
    nameRecord.metadata.completionTokens = completion.usage.completion_tokens;
    
    // Calculate cost (example: 0.1 credits per generation)
    const cost = 0.1;
    nameRecord.cost = cost;
    
    await nameRecord.save();

    // Update user
    user.credits -= cost;
    user.statistics.totalGenerations += 1;
    await user.save();

    res.json({
      name: nameRecord,
      creditsRemaining: user.credits
    });
  } catch (error) {
    next(error);
  }
});

// Get user's names
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    
    const query = { userId: req.user.id };
    if (category) query.category = category;
    if (status) query.status = status;

    const names = await Name.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Name.countDocuments(query);

    res.json({
      names,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get name by ID
router.get('/:id', async (req, res, next) => {
  try {
    const name = await Name.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!name) {
      const error = new Error('Name not found');
      error.name = 'NotFoundError';
      throw error;
    }

    res.json({ name });
  } catch (error) {
    next(error);
  }
});

// Update name
router.patch('/:id', async (req, res, next) => {
  try {
    const { rating, isFavorite, isPublic } = req.body;

    const name = await Name.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!name) {
      const error = new Error('Name not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (rating !== undefined) {
      name.rating = rating;
    }
    if (isFavorite !== undefined) {
      name.isFavorite = isFavorite;
    }
    if (isPublic !== undefined) {
      name.isPublic = isPublic;
    }

    await name.save();

    res.json({ name });
  } catch (error) {
    next(error);
  }
});

// Delete name
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Name.deleteOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (result.deletedCount === 0) {
      const error = new Error('Name not found');
      error.name = 'NotFoundError';
      throw error;
    }

    res.json({ message: 'Name deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get public names
router.get('/public/list', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const query = { isPublic: true };
    if (category) query.category = category;

    const names = await Name.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username');

    const total = await Name.countDocuments(query);

    res.json({
      names,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 