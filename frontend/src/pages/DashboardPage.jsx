import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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
  getExpenseTrends,
  getRecentExpenses,
} from '../services/dashboardService';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/constants';

const CHART_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#4f46e5',
  '#64748b',
];

function CustomTrendTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">{data.full_label || data.label}</p>
        <p className="tooltip-amount">{formatCurrency(data.total)}</p>
        {data.count !== undefined && (
          <p className="tooltip-count">
            {data.count} {data.count === 1 ? 'expense' : 'expenses'}
          </p>
        )}
      </div>
    );
  }
  return null;
}

function CustomCategoryTooltip({ active, payload, totalSpent }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percentage = totalSpent > 0 ? ((item.value / totalSpent) * 100).toFixed(1) : 0;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">{item.name}</p>
        <p className="tooltip-amount">{formatCurrency(item.value)}</p>
        <p className="tooltip-count">{percentage}% of total expenses</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState('week'); // 'week' | 'days' | 'month'
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = prev week, etc.
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial dashboard load
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryRes, trendsRes, categoryRes, recentRes] = await Promise.all([
          getDashboardSummary(),
          getExpenseTrends('week', 0).catch((err) => {
            console.error('Failed to load trends:', err);
            return null;
          }),
          getCategoryExpenses().catch((err) => {
            console.error('Failed to load categories:', err);
            return [];
          }),
          getRecentExpenses().catch((err) => {
            console.error('Failed to load recent expenses:', err);
            return [];
          }),
        ]);
        setSummary(summaryRes);
        setTrendData(trendsRes);
        // Ensure category amounts are strictly numbers for Recharts Pie
        setCategoryData(
          (categoryRes || []).map((item) => ({
            ...item,
            total: Number(item.total) || 0,
          }))
        );
        setRecentExpenses(recentRes || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load dashboard.'));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Fetch trends when period or week offset changes
  const fetchTrends = useCallback(async (period, offset) => {
    setTrendLoading(true);
    try {
      const res = await getExpenseTrends(period, offset);
      setTrendData(res);
    } catch (err) {
      console.error('Failed to load expense trends:', err);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setTrendPeriod(newPeriod);
    setWeekOffset(0);
    fetchTrends(newPeriod, 0);
  };

  const handlePrevWeek = () => {
    const nextOffset = weekOffset - 1;
    setWeekOffset(nextOffset);
    fetchTrends('week', nextOffset);
  };

  const handleNextWeek = () => {
    if (weekOffset >= 0) return;
    const nextOffset = weekOffset + 1;
    setWeekOffset(nextOffset);
    fetchTrends('week', nextOffset);
  };

  const handleResetWeek = () => {
    setWeekOffset(0);
    fetchTrends('week', 0);
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  const categoryTotalAmount = categoryData.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return (
    <div className="dashboard-page">
      {/* Metric Summary Cards */}
      <section className="summary-grid">
        <article className="summary-card">
          <p>Total Expenses</p>
          <h3>{formatCurrency(summary?.total_expenses || 0)}</h3>
        </article>
        <article className="summary-card">
          <p>This Month</p>
          <h3>{formatCurrency(summary?.expenses_this_month || 0)}</h3>
        </article>
        <article className="summary-card">
          <p>Today</p>
          <h3>{formatCurrency(summary?.expenses_today || 0)}</h3>
        </article>
        <article className="summary-card">
          <p>Total Records</p>
          <h3>{summary?.total_count || 0}</h3>
        </article>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        {/* Dynamic Expense Trends Chart */}
        <article className="chart-card trend-chart-card">
          <div className="chart-header-row">
            <div>
              <h3>Expense Trend</h3>
              <p className="chart-subtitle">{trendData?.title || 'Spending pattern over time'}</p>
            </div>
            <div className="chart-controls">
              <label htmlFor="trend-period-select" className="sr-only">
                Select View
              </label>
              <select
                id="trend-period-select"
                className="chart-period-select"
                value={trendPeriod}
                onChange={handlePeriodChange}
                aria-label="Filter expense trends by period"
              >
                <option value="week">Week (Mon - Sun)</option>
                <option value="days">Days (Last 14 Days)</option>
                <option value="month">Month (Monthly Overview)</option>
              </select>
            </div>
          </div>

          {/* Week Navigation bar when Week view is selected */}
          {trendPeriod === 'week' && (
            <div className="week-navigation-bar">
              <button
                type="button"
                className="week-nav-btn"
                onClick={handlePrevWeek}
                title="View previous week"
              >
                ‹ Previous Week
              </button>
              <span className="week-indicator-text">
                {weekOffset === 0 ? 'Current Week' : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
              </span>
              <button
                type="button"
                className="week-nav-btn"
                onClick={handleNextWeek}
                disabled={weekOffset >= 0}
                title={weekOffset >= 0 ? 'No future weeks' : 'View next week'}
              >
                Next Week ›
              </button>
              {weekOffset !== 0 && (
                <button
                  type="button"
                  className="week-nav-btn today-btn"
                  onClick={handleResetWeek}
                >
                  This Week
                </button>
              )}
            </div>
          )}

          {/* Summary Chips for Period */}
          {trendData && (
            <div className="trend-stats-bar">
              <div className="trend-stat-chip">
                <span>Period Total:</span>
                <strong>{formatCurrency(trendData.total_amount || 0)}</strong>
              </div>
              <div className="trend-stat-chip">
                <span>Daily Avg:</span>
                <strong>{formatCurrency(trendData.average_daily || 0)}</strong>
              </div>
              {trendData.peak_day && trendData.peak_amount > 0 && (
                <div className="trend-stat-chip highlight">
                  <span>Peak:</span>
                  <strong>{formatCurrency(trendData.peak_amount)}</strong>
                  <small>({trendData.peak_day.split(',')[0]})</small>
                </div>
              )}
            </div>
          )}

          {/* Trend Area Chart showing ups and downs */}
          <div className="chart-render-wrapper" style={{ opacity: trendLoading ? 0.6 : 1 }}>
            {trendData?.items?.length ? (
              <ResponsiveContainer width="100%" height={290}>
                <AreaChart
                  data={trendData.items}
                  margin={{ top: 12, right: 16, left: -10, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
                    }
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#trendGradient)"
                    dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No trend data" message="No expenses recorded for this period." />
            )}
          </div>
        </article>

        {/* Expenses by Category Card */}
        <article className="chart-card category-chart-card">
          <div className="chart-header-row">
            <div>
              <h3>Expenses by Category</h3>
              <p className="chart-subtitle">
                {categoryData.length
                  ? `${categoryData.length} categories • Total ${formatCurrency(categoryTotalAmount)}`
                  : 'Breakdown of your expenditures'}
              </p>
            </div>
          </div>

          {categoryData.length ? (
            <div className="category-chart-content">
              {/* Recharts Pie Chart */}
              <div className="category-pie-container">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.category}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomCategoryTooltip totalSpent={categoryTotalAmount} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Table / Badges */}
              <div className="category-breakdown-list">
                {categoryData.map((entry, index) => {
                  const color = CHART_COLORS[index % CHART_COLORS.length];
                  const percent = categoryTotalAmount > 0
                    ? ((entry.total / categoryTotalAmount) * 100).toFixed(1)
                    : '0';

                  return (
                    <div key={entry.category} className="category-breakdown-row">
                      <div className="category-row-info">
                        <span className="category-color-dot" style={{ backgroundColor: color }} />
                        <span className="category-name-text">{entry.category}</span>
                        <span className="category-count-pill">{entry.count} {entry.count === 1 ? 'txn' : 'txns'}</span>
                      </div>
                      <div className="category-row-values">
                        <strong className="category-amount-text">{formatCurrency(entry.total)}</strong>
                        <span className="category-percent-badge">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No category data"
              message="Add expenses to see category breakdown."
            />
          )}
        </article>
      </section>

      {/* Recent Expenses List */}
      <section className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3>Recent Expenses</h3>
            <p className="chart-subtitle">Your latest recorded transactions</p>
          </div>
        </div>
        {recentExpenses.length ? (
          <div className="recent-list">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="recent-item">
                <div className="recent-item-meta">
                  <span className="category-badge">{expense.category}</span>
                  <strong>{expense.reason}</strong>
                  <span>{formatDate(expense.expense_date)}</span>
                </div>
                <strong className="recent-item-amount">{formatCurrency(expense.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recent expenses"
            message="Your latest expenses will appear here."
          />
        )}
      </section>
    </div>
  );
}
