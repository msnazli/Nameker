import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

// Names
export const getNames = async ({ page = 1, limit = 10, category = '' } = {}) => {
  const response = await axios.get(`${API_URL}/api/names`, {
    params: { page, limit, category }
  });
  return response.data;
};

export const updateName = async (id: string, updates: any) => {
  const response = await axios.put(`${API_URL}/api/names/${id}`, updates);
  return response.data;
};

export const deleteName = async (id: string) => {
  const response = await axios.delete(`${API_URL}/api/names/${id}`);
  return response.data;
};

export const generateName = async (params: any) => {
  const response = await axios.post(`${API_URL}/api/names/generate`, params);
  return response.data;
};

// Payments
export const createPayment = async (params: { credits: number; amount: number }) => {
  const response = await axios.post(`${API_URL}/api/payment/create`, params);
  return response.data;
};

// Auth
export const verifyPayment = async (params: { orderId: string }) => {
  const response = await axios.post(`${API_URL}/api/payment/verify`, params);
  return response.data;
}; 