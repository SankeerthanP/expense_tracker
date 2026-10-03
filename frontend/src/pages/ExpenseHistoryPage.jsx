import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ExpenseTable, { EditExpenseModal } from '../components/ExpenseTable';
import LoadingState from '../components/LoadingState';
import { useToast } from '../context/ToastContext';
import { deleteExpense, getExpenses, updateExpense } from '../services/expenseService';
import {
  CATEGORY_ICONS,
  EXPENSE_CATEGORIES,
  SORT_OPTIONS,
  exportExpensesToCSV,
  formatCurrency,
  getErrorMessage,
} from '../utils/constants';

export default function ExpenseHistoryPage() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editExpense, setEditExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'cards' : 'table';
    }
    return 'table';
  });

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

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      start_date: '',
      end_date: '',
      sort: 'newest',
    });
  };

  const handleQuickDateFilter = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === 'today') {
      setFilters((prev) => ({ ...prev, start_date: todayStr, end_date: todayStr }));
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      setFilters((prev) => ({ ...prev, start_date: firstDay, end_date: todayStr }));
    } else if (preset === '30days') {
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setFilters((prev) => ({ ...prev, start_date: past30, end_date: todayStr }));
    } else {
      // all
      setFilters((prev) => ({ ...prev, start_date: '', end_date: '' }));
    }
  };

  const handleExportCSV = () => {
    if (!expenses.length) {
      showToast('No expenses to export.', 'error');
      return;
    }
    const filename = `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    const success = exportExpensesToCSV(expenses, filename);
    if (success) {
      showToast(`Exported ${expenses.length} records to ${filename}`);
    } else {
      showToast('Export failed.', 'error');
    }
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
        expense_time: formData.expense_time.length === 5 ? `${formData.expense_time}:00` : formData.expense_time,
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

  // Filter calculations
  const isFiltered = Boolean(
    filters.search || filters.category || filters.start_date || filters.end_date || filters.sort !== 'newest'
  );
  const totalFilteredAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const avgExpense = expenses.length ? totalFilteredAmount / expenses.length : 0;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2>Expense History</h2>
          <p>Search, filter, analyze, and export your personal transactions</p>
        </div>
        <div className="history-header-actions">
          <button
            type="button"
            className="secondary-btn export-btn"
            onClick={handleExportCSV}
            disabled={!expenses.length}
            title="Download CSV spreadsheet"
          >
            <span>📥</span> Export CSV
          </button>
          <div className="view-mode-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              📊 Table
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards view"
            >
              🗂️ Cards
            </button>
          </div>
        </div>
      </div>

      {/* Quick Date Range Filter Chips */}
      <div className="date-filter-presets">
        <span className="preset-label">Quick Dates:</span>
        <button
          type="button"
          className={`date-preset-chip ${!filters.start_date && !filters.end_date ? 'active' : ''}`}
          onClick={() => handleQuickDateFilter('all')}
        >
          All Time
        </button>
        <button
          type="button"
          className={`date-preset-chip ${filters.start_date === filters.end_date && filters.start_date === new Date().toISOString().slice(0, 10) ? 'active' : ''}`}
          onClick={() => handleQuickDateFilter('today')}
        >
          Today
        </button>
        <button
          type="button"
          className="date-preset-chip"
          onClick={() => handleQuickDateFilter('month')}
        >
          This Month
        </button>
        <button
          type="button"
          className="date-preset-chip"
          onClick={() => handleQuickDateFilter('30days')}
        >
          Last 30 Days
        </button>
      </div>

      {/* Filters Form Card */}
      <div className="filters-card">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            name="search"
            placeholder="Search by reason / note..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories ({EXPENSE_CATEGORIES.length})</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_ICONS[category] || '🏷️'} {category}
            </option>
          ))}
        </select>

        <div className="filter-date-group">
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            title="Start Date"
            aria-label="Start Date"
          />
          <span className="date-range-sep">to</span>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            title="End Date"
            aria-label="End Date"
          />
        </div>

        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filter Metrics Bar */}
      <div className="filter-summary-bar">
        <div className="filter-stats">
          <div className="filter-stat-item">
            <span>Filtered Total:</span>
            <strong>{formatCurrency(totalFilteredAmount)}</strong>
          </div>
          <div className="filter-stat-item">
            <span>Count:</span>
            <strong>{expenses.length} records</strong>
          </div>
          {expenses.length > 0 && (
            <div className="filter-stat-item">
              <span>Average:</span>
              <strong>{formatCurrency(avgExpense)}</strong>
            </div>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleResetFilters}
            title="Reset all filters"
          >
            ✕ Reset Filters
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <LoadingState message="Loading expenses..." />
      ) : expenses.length ? (
        <ExpenseTable
          expenses={expenses}
          onEdit={setEditExpense}
          onDelete={handleDelete}
          viewMode={viewMode}
        />
      ) : (
        <EmptyState
          title="No expenses found"
          message={isFiltered ? 'Try clearing or adjusting filters.' : 'Add your first expense to get started.'}
        />
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
