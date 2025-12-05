import api from './api';

export const storesService = {
  async getStores() {
    const response = await api.get('/stores');
    return response.data;
  },

  async createStore(data) {
    const response = await api.post('/stores', data);
    return response.data;
  },

  async syncStore(storeId) {
    const response = await api.post(`/ingestion/stores/${storeId}/sync`);
    return response.data;
  },
};
