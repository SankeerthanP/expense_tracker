import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function ExpenseForm({ formData, onChange, onSubmit, submitLabel, loading }) {
  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          Amount
          <input
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Category
          <select name="category" value={formData.category} onChange={onChange} required>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="full-width">
          Reason / Description
          <textarea
            name="reason"
            rows="3"
            value={formData.reason}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Date
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={onChange}
            required
          />
        </label>

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

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
