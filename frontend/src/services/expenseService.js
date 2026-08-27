import api from './api';

export async function createExpense(data) {
  const response = await api.post('/expenses', data);
  return response.data;
}

export async function getExpenses(params = {}) {
  const response = await api.get('/expenses', { params });
  return response.data;
}

export async function getExpense(id) {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
}

export async function updateExpense(id, data) {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
