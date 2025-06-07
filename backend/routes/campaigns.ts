import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Campaign } from '@nameker/shared/types';
import type { ApiResponse } from '@nameker/shared/types';
import { auth, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all campaigns with filtering and pagination
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      sponsorId,
      search 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(sponsorId && { sponsorId }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      })
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          sponsor: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.campaign.count({ where })
    ]);

    const response: ApiResponse<{ campaigns: Campaign[]; total: number }> = {
      success: true,
      data: {
        campaigns,
        total
      }
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
    };
    res.status(500).json(response);
  }
});

// Get campaign by ID
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        sponsor: true
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const response: ApiResponse<Campaign> = {
      success: true,
      data: campaign
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaign'
    };
    res.status(500).json(response);
  }
});

// Create campaign
router.post('/', [auth, requireAdmin], async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.create({
      data: {
        ...req.body,
        budget: parseFloat(req.body.budget),
        spentBudget: 0,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          roi: 0
        }
      },
      include: {
        sponsor: true
      }
    });

    const response: ApiResponse<Campaign> = {
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create campaign'
    };
    res.status(500).json(response);
  }
});

// Update campaign
router.put('/:id', [auth, requireAdmin], async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        budget: parseFloat(req.body.budget),
        spentBudget: parseFloat(req.body.spentBudget)
      },
      include: {
        sponsor: true
      }
    });

    const response: ApiResponse<Campaign> = {
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update campaign'
    };
    res.status(500).json(response);
  }
});

// Update campaign metrics
router.patch('/:id/metrics', auth, async (req: Request, res: Response) => {
  try {
    const { impressions, clicks, conversions } = req.body;
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const updatedMetrics = {
      impressions: Number(impressions),
      clicks: Number(clicks),
      conversions: Number(conversions),
      roi: (Number(conversions) * 100) / campaign.budget
    };

    const updatedCampaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        metrics: updatedMetrics
      },
      include: {
        sponsor: true
      }
    });

    const response: ApiResponse<Campaign> = {
      success: true,
      data: updatedCampaign,
      message: 'Campaign metrics updated successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update campaign metrics'
    };
    res.status(500).json(response);
  }
});

// Delete campaign
router.delete('/:id', [auth, requireAdmin], async (req: Request, res: Response) => {
  try {
    await prisma.campaign.delete({
      where: { id: req.params.id }
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Campaign deleted successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete campaign'
    };
    res.status(500).json(response);
  }
});

export default router; 