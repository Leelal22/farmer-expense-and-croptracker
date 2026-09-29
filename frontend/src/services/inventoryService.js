import api from './api';

export const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  getInventoryItemById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  createInventoryItem: async (inventoryData) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },

  updateInventoryItem: async (id, inventoryData) => {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
  },

  deleteInventoryItem: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};
