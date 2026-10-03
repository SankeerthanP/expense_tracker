import { CATEGORY_ICONS, EXPENSE_CATEGORIES, formatCurrency } from '../utils/constants';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function ExpenseForm({ formData, onChange, onSubmit, submitLabel, loading }) {
  const handleAddPreset = (value) => {
    const current = Number(formData.amount) || 0;
    const nextVal = current === 0 ? value : current + value;
    onChange({
      target: {
        name: 'amount',
        value: nextVal.toString(),
      },
    });
  };

  const handleSelectCategory = (cat) => {
    onChange({
      target: {
        name: 'category',
        value: cat,
      },
    });
  };

  const handleSetQuickDate = (type) => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    onChange({
      target: {
        name: 'expense_date',
        value: d.toISOString().slice(0, 10),
      },
    });
  };

  const amountNumber = Number(formData.amount);

  return (
    <form className="form-card enhanced-expense-form" onSubmit={onSubmit}>
      {/* Category Grid Selection */}
      <div className="form-category-section">
        <label className="section-label">Select Category</label>
        <div className="category-tiles-grid">
          {EXPENSE_CATEGORIES.map((category) => {
            const isSelected = formData.category === category;
            const icon = CATEGORY_ICONS[category] || '🏷️';
            return (
              <button
                key={category}
                type="button"
                className={`category-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectCategory(category)}
              >
                <span className="category-tile-icon">{icon}</span>
                <span className="category-tile-name">{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-grid">
        {/* Amount Input with Live Preview and Presets */}
        <div className="form-amount-group full-width">
          <label htmlFor="expense-amount-input">
            Amount (₹)
            {amountNumber > 0 && (
              <span className="amount-preview-pill">
                {formatCurrency(amountNumber)}
              </span>
            )}
          </label>
          <div className="amount-input-wrapper">
            <span className="currency-prefix">₹</span>
            <input
              id="expense-amount-input"
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={onChange}
              required
              autoFocus
            />
          </div>

          {/* Quick Increment Chips */}
          <div className="preset-amounts-row">
            <span className="preset-label">Quick Add:</span>
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                className="preset-chip"
                onClick={() => handleAddPreset(amt)}
              >
                +₹{amt}
              </button>
            ))}
            {amountNumber > 0 && (
              <button
                type="button"
                className="preset-chip clear-amt"
                onClick={() => onChange({ target: { name: 'amount', value: '' } })}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Reason / Description */}
        <label className="full-width">
          Reason / Description
          <textarea
            name="reason"
            rows="2"
            placeholder="What was this expense for? (e.g. Lunch with team, Groceries, Fuel)"
            value={formData.reason}
            onChange={onChange}
            required
          />
        </label>

        {/* Date with Quick Today / Yesterday presets */}
        <div>
          <label>
            Date
            <div className="quick-date-buttons">
              <button
                type="button"
                className="date-pill"
                onClick={() => handleSetQuickDate('today')}
              >
                Today
              </button>
              <button
                type="button"
                className="date-pill"
                onClick={() => handleSetQuickDate('yesterday')}
              >
                Yesterday
              </button>
            </div>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={onChange}
              required
            />
          </label>
        </div>

        {/* Time */}
        <label>
          Time
          <input
            type="time"
            name="expense_time"
            value={formData.expense_time}
            onChange={onChange}
            required
          />
        </label>
      </div>

      <div className="form-submit-row">
        <button type="submit" className="primary-btn submit-btn" disabled={loading}>
          {loading ? 'Saving Expense...' : `✓ ${submitLabel}`}
        </button>
      </div>
    </form>
  );
}
