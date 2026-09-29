import api from './api';

export const incomeService = {
  getIncomes: async (params = {}) => {
    const response = await api.get('/incomes', { params });
    return response.data;
  },

  getIncomeById: async (id) => {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
  },

  createIncome: async (incomeData) => {
    const response = await api.post('/incomes', incomeData);
    return response.data;
  },

  updateIncome: async (id, incomeData) => {
    const response = await api.put(`/incomes/${id}`, incomeData);
    return response.data;
  },

  deleteIncome: async (id) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  }
};
