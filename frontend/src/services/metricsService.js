import api from './api';

export const getSummary = async (storeId, from, to) => {
  const params = {};
  if (storeId) params.storeId = storeId;
  if (from) params.from = from instanceof Date ? from.toISOString() : from;
  if (to) params.to = to instanceof Date ? to.toISOString() : to;
  
  const response = await api.get('/metrics/summary', { params });
  return response.data;
};

export const getOrdersByDate = async (storeId, from, to) => {
  const params = {};
  if (storeId) params.storeId = storeId;
  if (from) params.from = from instanceof Date ? from.toISOString() : from;
  if (to) params.to = to instanceof Date ? to.toISOString() : to;
  
  const response = await api.get('/metrics/orders-by-date', { params });
  return response.data;
};

export const getTopCustomers = async (storeId, from, to, limit = 10) => {
  const params = { limit };
  if (storeId) params.storeId = storeId;
  if (from) params.from = from instanceof Date ? from.toISOString() : from;
  if (to) params.to = to instanceof Date ? to.toISOString() : to;
  
  const response = await api.get('/metrics/top-customers', { params });
  return response.data;
};
