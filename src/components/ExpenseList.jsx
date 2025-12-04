import React, { useState, useEffect } from 'react';

function ExpenseList({ expenses, onEdit, onDelete }) {
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    // Load calculation periods to show period names
    const stored = localStorage.getItem('calculationPeriods');
    if (stored) {
      try {
        setPeriods(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading periods:', e);
      }
    }
  }, []);

  if (!expenses || expenses.length === 0) {
    return <p className="no-data">Δεν υπάρχουν καταχωρημένες δαπάνες.</p>;
  }

  const total = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

  const getPeriodName = (periodId) => {
    if (!periodId) return '-';
    const period = periods.find(p => p.id === periodId);
    return period ? period.name : `Period ${periodId}`;
  };

  const canEdit = (expense) => {
    return !expense.periodId; // Can only edit expenses not in a period
  };

  return (
    <div className="expense-list">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Α/Α</th>
            <th>Κωδικός</th>
            <th>Κατηγορία</th>
            <th>Περιγραφή</th>
            <th>Ποσό (€)</th>
            <th>Ημερομηνία</th>
            <th>Περίοδος</th>
            <th>Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className={expense.periodId ? 'expense-in-period' : ''}>
              <td>{expense.id}</td>
              <td>{expense.code}</td>
              <td>{expense.category || '-'}</td>
              <td>{expense.description}</td>
              <td className="amount">{parseFloat(expense.amount || 0).toFixed(2)}</td>
              <td>{expense.date}</td>
              <td>
                {expense.periodId ? (
                  <span className="period-badge" title={`Period ID: ${expense.periodId}`}>
                    {getPeriodName(expense.periodId)}
                  </span>
                ) : (
                  <span className="no-period">-</span>
                )}
              </td>
              <td>
                {canEdit(expense) ? (
                  <div className="action-buttons">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(expense)}
                        className="btn btn-small"
                        title="Επεξεργασία"
                      >
                        ✏️ Επεξεργασία
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="btn btn-small"
                        style={{ background: '#dc3545' }}
                        title="Διαγραφή"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="locked-badge" title="Η δαπάνη ανήκει σε περίοδο υπολογισμού">
                    🔒 Κλειδωμένη
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="6"><strong>Σύνολο:</strong></td>
            <td className="amount"><strong>{total.toFixed(2)} €</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ExpenseList;


