import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import { formatCurrency, formatDate, formatTime } from '../utils/constants';

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  const [deleteId, setDeleteId] = useState(null);

  if (!expenses.length) {
    return null;
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Category</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{formatDate(expense.expense_date)}</td>
                <td>{formatTime(expense.expense_time)}</td>
                <td>
                  <span className="category-badge">{expense.category}</span>
                </td>
                <td>{expense.reason}</td>
                <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                <td className="actions-cell">
                  <button type="button" className="text-btn" onClick={() => onEdit(expense)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-btn danger"
                    onClick={() => setDeleteId(expense.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete expense?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={() => {
                  onDelete(deleteId);
                  setDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EditExpenseModal({ expense, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    amount: expense.amount,
    category: expense.category,
    reason: expense.reason,
    expense_date: expense.expense_date,
    expense_time: expense.expense_time.slice(0, 5),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card wide">
        <div className="modal-header">
          <h3>Edit Expense</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <ExpenseForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Update Expense"
          loading={loading}
        />
      </div>
    </div>
  );
}
