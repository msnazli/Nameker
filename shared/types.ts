export interface Sponsor {
  id: string;
  name: string;
  email: string;
  website: string;
  logo: string;
  type: 'premium' | 'standard' | 'basic';
  status: 'active' | 'pending' | 'inactive';
  budget: number;
  spentBudget: number;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  sponsorId: string;
  type: 'banner' | 'featured' | 'popup' | 'email';
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  budget: number;
  spentBudget: number;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  promoCode?: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 