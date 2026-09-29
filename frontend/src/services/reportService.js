import api from './api';

export const reportService = {
  getCropProfitabilityReport: async (params = {}) => {
    const response = await api.get('/reports/crop-profitability', { params });
    return response.data;
  },

  getExpenseReport: async (params = {}) => {
    const response = await api.get('/reports/expenses', { params });
    return response.data;
  },

  getIncomeReport: async (params = {}) => {
    const response = await api.get('/reports/income', { params });
    return response.data;
  },

  getFarmPerformanceReport: async (params = {}) => {
    const response = await api.get('/reports/farm-performance', { params });
    return response.data;
  },

  getMonthlySummaryReport: async () => {
    const response = await api.get('/reports/monthly-summary');
    return response.data;
  },

  exportCSV: async (endpoint, params = {}, filename = 'report.csv') => {
    const response = await api.get(`/reports/${endpoint}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
