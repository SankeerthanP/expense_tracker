import api from './api';

export async function getDashboardSummary() {
  const response = await api.get('/dashboard/summary');
  return response.data;
}

export async function getMonthlyExpenses() {
  const response = await api.get('/dashboard/monthly-expenses');
  return response.data;
}

export async function getCategoryExpenses() {
  const response = await api.get('/dashboard/category-expenses');
  return response.data;
}

export async function getRecentExpenses(limit = 5) {
  const response = await api.get('/dashboard/recent-expenses', { params: { limit } });
  return response.data;
}
