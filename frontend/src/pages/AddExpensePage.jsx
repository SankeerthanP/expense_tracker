import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';
import { useToast } from '../context/ToastContext';
import { createExpense } from '../services/expenseService';
import { EXPENSE_CATEGORIES, getErrorMessage } from '../utils/constants';

function getDefaultFormData() {
  const now = new Date();
  return {
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    reason: '',
    expense_date: now.toISOString().slice(0, 10),
    expense_time: now.toTimeString().slice(0, 5),
  };
}

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(getDefaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createExpense({
        ...formData,
        amount: Number(formData.amount),
        expense_time: `${formData.expense_time}:00`,
      });
      showToast('Expense added successfully.');
      navigate('/expenses');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add expense.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <h2>Add Expense</h2>
        <p>Record a new personal expense</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <ExpenseForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Add Expense"
        loading={loading}
      />
    </div>
  );
}
