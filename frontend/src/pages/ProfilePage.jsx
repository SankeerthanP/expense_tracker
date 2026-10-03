import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboardSummary } from '../services/dashboardService';
import { getExpenses } from '../services/expenseService';
import { exportExpensesToCSV, formatCurrency, formatDate } from '../utils/constants';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const budgetStorageKey = `expense_tracker_budget_${user?.id || 'default'}`;
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem(budgetStorageKey);
    return saved ? Number(saved) : 25000;
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.toString());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getDashboardSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error('Failed to load profile summary:', err))
      .finally(() => setLoadingStats(false));
  }, []);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!val || val <= 0) {
      showToast('Please enter a valid budget amount.', 'error');
      return;
    }
    setBudget(val);
    localStorage.setItem(budgetStorageKey, val.toString());
    setEditingBudget(false);
    showToast(`Monthly budget updated to ${formatCurrency(val)}`);
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const allExpenses = await getExpenses({ sort: 'newest' });
      if (!allExpenses || !allExpenses.length) {
        showToast('No expenses found to export.', 'error');
        return;
      }
      const filename = `all_expenses_export_${new Date().toISOString().slice(0, 10)}.csv`;
      exportExpensesToCSV(allExpenses, filename);
      showToast(`Exported ${allExpenses.length} records to ${filename}`);
    } catch {
      showToast('Failed to export data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2>Account & Preferences</h2>
          <p>Manage your profile, financial targets, and account settings</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* User Card */}
        <div className="profile-card profile-user-hero">
          <div className="profile-avatar-large">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-hero-info">
            <h3>{user?.name || 'User'}</h3>
            <p className="profile-email-badge">{user?.email}</p>
            <span className="profile-joined-text">
              Member since {user?.created_at ? formatDate(user.created_at) : 'Recent'}
            </span>
          </div>
        </div>

        {/* Financial Overview Stats */}
        <div className="profile-card">
          <h4 className="profile-card-title">📊 Lifetime Overview</h4>
          <div className="profile-stats-row">
            <div className="profile-stat-box">
              <span>All-Time Spent</span>
              <strong>
                {loadingStats ? '...' : formatCurrency(summary?.total_expenses || 0)}
              </strong>
            </div>
            <div className="profile-stat-box">
              <span>This Month</span>
              <strong>
                {loadingStats ? '...' : formatCurrency(summary?.expenses_this_month || 0)}
              </strong>
            </div>
            <div className="profile-stat-box">
              <span>Total Records</span>
              <strong>{loadingStats ? '...' : summary?.total_count || 0}</strong>
            </div>
          </div>
        </div>

        {/* Monthly Budget Settings */}
        <div className="profile-card">
          <div className="profile-card-header-flex">
            <div>
              <h4 className="profile-card-title">🎯 Monthly Budget Target</h4>
              <p className="profile-card-subtitle">
                Used to compute remaining budget and daily safe spending recommendations.
              </p>
            </div>
            {!editingBudget && (
              <button
                type="button"
                className="secondary-btn btn-sm"
                onClick={() => {
                  setBudgetInput(budget.toString());
                  setEditingBudget(true);
                }}
              >
                ✏️ Change
              </button>
            )}
          </div>

          {editingBudget ? (
            <form onSubmit={handleSaveBudget} className="budget-edit-form">
              <div className="budget-input-group">
                <span className="currency-prefix">₹</span>
                <input
                  type="number"
                  min="100"
                  step="500"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="25000"
                  autoFocus
                />
              </div>
              <div className="budget-edit-actions">
                <button
                  type="button"
                  className="secondary-btn btn-sm"
                  onClick={() => setEditingBudget(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn btn-sm">
                  Save Target
                </button>
              </div>
            </form>
          ) : (
            <div className="budget-display-value">
              <span className="budget-amount-pill">{formatCurrency(budget)}</span>
              <span className="budget-period-text">per calendar month</span>
            </div>
          )}
        </div>

        {/* Account Data & Security */}
        <div className="profile-card">
          <h4 className="profile-card-title">⚙️ Data & Actions</h4>
          <div className="profile-actions-list">
            <div className="profile-action-row">
              <div>
                <strong>Export Expense Data</strong>
                <p>Download a complete CSV spreadsheet of all your logged expenses.</p>
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleExportAll}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : '📥 Export CSV'}
              </button>
            </div>

            <div className="profile-action-row danger-row">
              <div>
                <strong>Sign Out</strong>
                <p>Log out of your current session on this device.</p>
              </div>
              <button type="button" className="danger-btn" onClick={logout}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
