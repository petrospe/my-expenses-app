import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseList from '../components/ExpenseList';
import EditExpenseModal from '../components/EditExpenseModal';
import api from '../services/api.js';

function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [availableDescriptions, setAvailableDescriptions] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const extractUniqueValues = (expensesList) => {
    const codes = [...new Set(expensesList.map(exp => exp.code).filter(Boolean))].sort();
    setAvailableCodes(codes);

    const descriptions = [...new Set(expensesList.map(exp => exp.description).filter(Boolean))].sort();
    setAvailableDescriptions(descriptions);

    const categories = [...new Set(expensesList.map(exp => exp.category).filter(Boolean))].sort();
    setAvailableCategories(categories);
  };

  useEffect(() => {
    // Load expenses - try API first, then localStorage, then JSON file
    const loadExpenses = async () => {
      try {
        // Try API first (backend)
        try {
          const apiExpenses = await api.getExpenses();
          setExpenses(apiExpenses);
          extractUniqueValues(apiExpenses);
          // Sync to localStorage
          localStorage.setItem('expenses', JSON.stringify(apiExpenses));
        } catch (apiError) {
          console.warn('API not available, using localStorage:', apiError);
          // Fallback to localStorage
          const stored = localStorage.getItem('expenses');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setExpenses(parsed);
              extractUniqueValues(parsed);
            } catch (e) {
              console.error('Error loading expenses from localStorage:', e);
              loadDefaultExpenses();
            }
          } else {
            loadDefaultExpenses();
          }
        }
      } catch (err) {
        console.error('Error loading expenses:', err);
        loadDefaultExpenses();
      }
    };

    loadExpenses();
  }, []);

  const loadDefaultExpenses = async () => {
    try {
      const expensesData = await import('../data/expenses.json');
      setExpenses(expensesData.default);
      extractUniqueValues(expensesData.default);
    } catch (e) {
      console.error('Error loading default expenses:', e);
    }
  };

  const handleEditExpense = (expense) => {
    if (expense.periodId) {
      alert('Δεν μπορείτε να επεξεργαστείτε δαπάνη που ανήκει σε περίοδο υπολογισμού!');
      return;
    }
    setEditingExpense(expense);
  };

  const handleSaveExpense = async (updatedExpense) => {
    try {
      // Try to save via API (backend)
      try {
        await api.updateExpense(updatedExpense.id, updatedExpense);
        
        // Update local state
        const updatedExpenses = expenses.map(exp => 
          exp.id === updatedExpense.id ? updatedExpense : exp
        );
        setExpenses(updatedExpenses);
        extractUniqueValues(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        
        setEditingExpense(null);
        alert('✅ Η δαπάνη ενημερώθηκε επιτυχώς!');
      } catch (apiError) {
        // Fallback to localStorage only
        console.warn('API update failed, using localStorage:', apiError);
        
        const updatedExpenses = expenses.map(exp => 
          exp.id === updatedExpense.id ? updatedExpense : exp
        );
        setExpenses(updatedExpenses);
        extractUniqueValues(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        
        setEditingExpense(null);
        alert('⚠️ Η δαπάνη ενημερώθηκε τοπικά (backend δεν είναι διαθέσιμος)');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Σφάλμα κατά την ενημέρωση της δαπάνης. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense?.periodId) {
      alert('Δεν μπορείτε να διαγράψετε δαπάνη που ανήκει σε περίοδο υπολογισμού!');
      return;
    }

    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη δαπάνη;')) {
      return;
    }

    try {
      // Try to delete via API (backend)
      try {
        await api.deleteExpense(expenseId);
      } catch (apiError) {
        console.warn('API delete failed, using localStorage:', apiError);
      }

      // Update local state
      const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
      setExpenses(updatedExpenses);
      extractUniqueValues(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      alert('Η δαπάνη διαγράφηκε επιτυχώς!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Σφάλμα κατά τη διαγραφή της δαπάνης. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  useEffect(() => {
    if (!filter) {
      setFilteredExpenses(expenses);
    } else {
      const filtered = expenses.filter(exp => 
        exp.description.toLowerCase().includes(filter.toLowerCase()) ||
        (exp.category && exp.category.toLowerCase().includes(filter.toLowerCase())) ||
        exp.code.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredExpenses(filtered);
    }
  }, [filter, expenses]);

  // Listen for storage changes (when new expense is added)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('expenses');
      if (stored) {
        try {
          setExpenses(JSON.parse(stored));
        } catch (e) {
          console.error('Error loading expenses:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const total = filteredExpenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0
  );

  return (
    <div className="page expenses-page">
      <h2>Διαχείριση Δαπανών</h2>
      
      <div className="page-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Αναζήτηση δαπανών..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="summary-box">
          <strong>Σύνολο: {total.toFixed(2)} €</strong>
          <span className="count">({filteredExpenses.length} δαπάνες)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button 
            onClick={() => navigate('/add-expense')}
            className="btn btn-primary"
          >
            + Προσθήκη Δαπάνης
          </button>
          <button 
            onClick={() => navigate('/archive')}
            className="btn btn-secondary"
          >
            Αρχείο & Εξαγωγή
          </button>
        </div>
      </div>

      <ExpenseList 
        expenses={filteredExpenses} 
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleSaveExpense}
          availableCodes={availableCodes}
          availableCategories={availableCategories}
          availableDescriptions={availableDescriptions}
        />
      )}
    </div>
  );
}

export default Expenses;
