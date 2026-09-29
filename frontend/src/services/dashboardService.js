import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getMonthlyFinancials: async () => {
    const response = await api.get('/dashboard/monthly-financials');
    return response.data;
  },

  getCropPerformance: async () => {
    const response = await api.get('/dashboard/crop-performance');
    return response.data;
  },

  getExpenseCategories: async () => {
    const response = await api.get('/dashboard/expense-categories');
    return response.data;
  },

  getCropStatusDistribution: async () => {
    const response = await api.get('/dashboard/crop-status');
    return response.data;
  }
};
