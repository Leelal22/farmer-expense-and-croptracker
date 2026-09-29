import api from './api';

export const harvestService = {
  getHarvests: async (params = {}) => {
    const response = await api.get('/harvests', { params });
    return response.data;
  },

  getHarvestById: async (id) => {
    const response = await api.get(`/harvests/${id}`);
    return response.data;
  },

  createHarvest: async (harvestData) => {
    const response = await api.post('/harvests', harvestData);
    return response.data;
  },

  updateHarvest: async (id, harvestData) => {
    const response = await api.put(`/harvests/${id}`, harvestData);
    return response.data;
  },

  deleteHarvest: async (id) => {
    const response = await api.delete(`/harvests/${id}`);
    return response.data;
  }
};
