import api from './api';

export const activityService = {
  getActivities: async (params = {}) => {
    const response = await api.get('/activities', { params });
    return response.data;
  },

  getActivityById: async (id) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  createActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  }
};
