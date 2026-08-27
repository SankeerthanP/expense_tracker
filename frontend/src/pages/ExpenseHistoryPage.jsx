import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ExpenseTable, { EditExpenseModal } from '../components/ExpenseTable';
import LoadingState from '../components/LoadingState';
import { useToast } from '../context/ToastContext';
import { deleteExpense, getExpenses, updateExpense } from '../services/expenseService';
import { EXPENSE_CATEGORIES, SORT_OPTIONS, getErrorMessage } from '../utils/constants';

export default function ExpenseHistoryPage() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editExpense, setEditExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    start_date: '',
    end_date: '',
    sort: 'newest',
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const data = await getExpenses(params);
      setExpenses(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load expenses.'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      showToast('Expense deleted.');
      loadExpenses();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete expense.'), 'error');
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await updateExpense(editExpense.id, {
        ...formData,
        amount: Number(formData.amount),
        expense_time: `${formData.expense_time}:00`,
      });
      showToast('Expense updated.');
      setEditExpense(null);
      loadExpenses();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update expense.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <h2>Expense History</h2>
        <p>Search, filter, and manage your expenses</p>
      </div>

      <div className="filters-card">
        <input
          type="search"
          name="search"
          placeholder="Search by reason..."
          value={filters.search}
          onChange={handleFilterChange}
        />

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />

        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <LoadingState message="Loading expenses..." />
      ) : expenses.length ? (
        <ExpenseTable expenses={expenses} onEdit={setEditExpense} onDelete={handleDelete} />
      ) : (
        <EmptyState title="No expenses found" message="Try adjusting filters or add a new expense." />
      )}

      {editExpense && (
        <EditExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSave={handleUpdate}
          loading={saving}
        />
      )}
    </div>
  );
}
