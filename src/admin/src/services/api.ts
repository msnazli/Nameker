import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface DashboardStats {
  users: {
    total: number;
    new: number;
    active: number;
  };
  names: {
    total: number;
    totalGenerated: number;
    averageGenerationTime: number;
    successRate: number;
  };
  payments: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
}

export interface User {
  _id: string;
  username: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  credits: number;
  isActive: boolean;
  createdAt: string;
  lastActive: string;
}

export interface Name {
  _id: string;
  name: string;
  description: string;
  userId: User;
  status: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Payment {
  _id: string;
  userId: User;
  amount: number;
  currency: string;
  status: string;
  credits: number;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: any;
  category: string;
  updatedAt: string;
  updatedBy: string;
}

// Auth endpoints
export const adminLogin = (telegramId: string) =>
  api.post('/auth/admin', { telegramId }).then((res) => res.data);

// Dashboard endpoints
export const getDashboardStats = () =>
  api.get<{ data: DashboardStats }>('/admin/stats').then((res) => res.data);

// User endpoints
export const getUsers = (params: { page?: number; limit?: number; search?: string; role?: string }) =>
  api.get('/admin/users', { params }).then((res) => res.data);

export const updateUser = (id: string, data: Partial<User>) =>
  api.patch(`/admin/users/${id}`, data).then((res) => res.data);

// Name endpoints
export const getNames = (params: { page?: number; limit?: number; status?: string; userId?: string }) =>
  api.get('/admin/names', { params }).then((res) => res.data);

// Payment endpoints
export const getPayments = (params: { page?: number; limit?: number; status?: string; userId?: string }) =>
  api.get('/admin/payments', { params }).then((res) => res.data);

export const refundPayment = (id: string, data: { reason: string; amount?: number }) =>
  api.post(`/admin/payments/${id}/refund`, data).then((res) => res.data);

// Settings endpoints
export const getSettings = (params?: { category?: string }) =>
  api.get('/admin/settings', { params }).then((res) => res.data);

export const updateSetting = (key: string, value: any) =>
  api.patch(`/admin/settings/${key}`, { value }).then((res) => res.data); 