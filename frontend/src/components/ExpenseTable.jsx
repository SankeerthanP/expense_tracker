import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import { CATEGORY_ICONS, formatCurrency, formatDate, formatTime } from '../utils/constants';

export default function ExpenseTable({ expenses, onEdit, onDelete, viewMode = 'table' }) {
  const [deleteExpenseItem, setDeleteExpenseItem] = useState(null);

  if (!expenses.length) {
    return null;
  }

  return (
    <>
      {viewMode === 'cards' ? (
        /* Mobile-Friendly Cards View */
        <div className="expense-cards-grid">
          {expenses.map((expense) => {
            const icon = CATEGORY_ICONS[expense.category] || '🏷️';
            return (
              <div key={expense.id} className="expense-entry-card">
                <div className="entry-card-top">
                  <div className="entry-card-meta">
                    <span className="category-badge">
                      <span className="badge-emoji">{icon}</span> {expense.category}
                    </span>
                    <span className="entry-card-datetime">
                      {formatDate(expense.expense_date)} • {formatTime(expense.expense_time)}
                    </span>
                  </div>
                  <strong className="entry-card-amount">{formatCurrency(expense.amount)}</strong>
                </div>

                <p className="entry-card-reason">{expense.reason}</p>

                <div className="entry-card-actions">
                  <button
                    type="button"
                    className="secondary-btn btn-sm"
                    onClick={() => onEdit(expense)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="danger-btn btn-sm"
                    onClick={() => setDeleteExpenseItem(expense)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Category</th>
                <th>Reason</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const icon = CATEGORY_ICONS[expense.category] || '🏷️';
                return (
                  <tr key={expense.id}>
                    <td>
                      <div className="table-datetime-cell">
                        <span className="table-date">{formatDate(expense.expense_date)}</span>
                        <span className="table-time">{formatTime(expense.expense_time)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        <span className="badge-emoji">{icon}</span> {expense.category}
                      </span>
                    </td>
                    <td className="reason-cell">{expense.reason}</td>
                    <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="text-btn action-edit-btn"
                        onClick={() => onEdit(expense)}
                        title="Edit expense"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="text-btn danger action-delete-btn"
                        onClick={() => setDeleteExpenseItem(expense)}
                        title="Delete expense"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal with Expense Details */}
      {deleteExpenseItem && (
        <div className="modal-overlay" onClick={() => setDeleteExpenseItem(null)}>
          <div className="modal-card delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">⚠️</div>
            <h3>Delete Expense?</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="delete-target-preview">
              <div className="delete-preview-row">
                <span>Reason:</span>
                <strong>{deleteExpenseItem.reason}</strong>
              </div>
              <div className="delete-preview-row">
                <span>Category:</span>
                <span>{CATEGORY_ICONS[deleteExpenseItem.category] || '🏷️'} {deleteExpenseItem.category}</span>
              </div>
              <div className="delete-preview-row">
                <span>Amount:</span>
                <strong className="text-danger">{formatCurrency(deleteExpenseItem.amount)}</strong>
              </div>
              <div className="delete-preview-row">
                <span>Date:</span>
                <span>{formatDate(deleteExpenseItem.expense_date)}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteExpenseItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={() => {
                  onDelete(deleteExpenseItem.id);
                  setDeleteExpenseItem(null);
                }}
              >
                Delete Expense
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
    expense_time: expense.expense_time ? expense.expense_time.slice(0, 5) : '12:00',
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Expense</h3>
          <button type="button" className="icon-btn close-modal-btn" onClick={onClose}>
            ✕
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
