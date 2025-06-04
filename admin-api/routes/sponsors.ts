import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Sponsor } from '@nameker/shared/types';
import type { ApiResponse } from '@nameker/shared/types';

const router = Router();
const prisma = new PrismaClient();

// Get all sponsors
router.get('/', async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      include: {
        campaigns: true
      }
    });
    const response: ApiResponse<Sponsor[]> = {
      success: true,
      data: sponsors
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sponsors'
    };
    res.status(500).json(response);
  }
});

// Get sponsor by ID
router.get('/:id', async (req, res) => {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: req.params.id },
      include: {
        campaigns: true
      }
    });
    if (!sponsor) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Sponsor not found'
      };
      return res.status(404).json(response);
    }
    const response: ApiResponse<Sponsor> = {
      success: true,
      data: sponsor
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sponsor'
    };
    res.status(500).json(response);
  }
});

// Create sponsor
router.post('/', async (req, res) => {
  try {
    const sponsor = await prisma.sponsor.create({
      data: {
        ...req.body,
        budget: parseFloat(req.body.budget),
        spentBudget: parseFloat(req.body.spentBudget || '0')
      }
    });
    const response: ApiResponse<Sponsor> = {
      success: true,
      data: sponsor,
      message: 'Sponsor created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create sponsor'
    };
    res.status(500).json(response);
  }
});

// Update sponsor
router.put('/:id', async (req, res) => {
  try {
    const sponsor = await prisma.sponsor.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        budget: parseFloat(req.body.budget),
        spentBudget: parseFloat(req.body.spentBudget)
      }
    });
    const response: ApiResponse<Sponsor> = {
      success: true,
      data: sponsor,
      message: 'Sponsor updated successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update sponsor'
    };
    res.status(500).json(response);
  }
});

// Delete sponsor
router.delete('/:id', async (req, res) => {
  try {
    await prisma.sponsor.delete({
      where: { id: req.params.id }
    });
    const response: ApiResponse<null> = {
      success: true,
      message: 'Sponsor deleted successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete sponsor'
    };
    res.status(500).json(response);
  }
});

export default router; 