import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import {
  getCategoryExpenses,
  getDashboardSummary,
  getMonthlyExpenses,
  getRecentExpenses,
} from '../services/dashboardService';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/constants';

const CHART_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777', '#4f46e5', '#64748b'];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryRes, monthlyRes, categoryRes, recentRes] = await Promise.all([
          getDashboardSummary(),
          getMonthlyExpenses(),
          getCategoryExpenses(),
          getRecentExpenses(),
        ]);
        setSummary(summaryRes);
        setMonthlyData(monthlyRes);
        setCategoryData(categoryRes);
        setRecentExpenses(recentRes);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load dashboard.'));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  return (
    <div className="dashboard-page">
      <section className="summary-grid">
        <article className="summary-card">
          <p>Total Expenses</p>
          <h3>{formatCurrency(summary.total_expenses)}</h3>
        </article>
        <article className="summary-card">
          <p>This Month</p>
          <h3>{formatCurrency(summary.expenses_this_month)}</h3>
        </article>
        <article className="summary-card">
          <p>Today</p>
          <h3>{formatCurrency(summary.expenses_today)}</h3>
        </article>
        <article className="summary-card">
          <p>Total Records</p>
          <h3>{summary.total_count}</h3>
        </article>
      </section>

      <section className="charts-grid">
        <article className="chart-card">
          <h3>Monthly Expense Trend</h3>
          {monthlyData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No monthly data" message="Add expenses to see trends." />
          )}
        </article>

        <article className="chart-card">
          <h3>Expenses by Category</h3>
          {categoryData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No category data" message="Add expenses to see category breakdown." />
          )}
        </article>
      </section>

      <section className="chart-card">
        <h3>Recent Expenses</h3>
        {recentExpenses.length ? (
          <div className="recent-list">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="recent-item">
                <div>
                  <strong>{expense.category}</strong>
                  <p>{expense.reason}</p>
                  <span>{formatDate(expense.expense_date)}</span>
                </div>
                <strong>{formatCurrency(expense.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No recent expenses" message="Your latest expenses will appear here." />
        )}
      </section>
    </div>
  );
}
