import React, { useState, useEffect } from 'react';
import tenantsData from '../data/tenants.json';
import heatingData from '../data/heating.json';
import api from '../services/api.js';

function Calculate() {
  const [expenses, setExpenses] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [calculationPeriods, setCalculationPeriods] = useState([]);
  const [currentPeriodName, setCurrentPeriodName] = useState('');
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [usedExpenseIds, setUsedExpenseIds] = useState(new Set());

  useEffect(() => {
    loadExpenses();
    loadCalculationPeriods();
  }, []);

  const loadExpenses = async () => {
    try {
      try {
        const apiExpenses = await api.getExpenses();
        setExpenses(apiExpenses);
        localStorage.setItem('expenses', JSON.stringify(apiExpenses));
      } catch (apiError) {
        const stored = localStorage.getItem('expenses');
        if (stored) {
          setExpenses(JSON.parse(stored));
        } else {
          const expensesData = await import('../data/expenses.json');
          setExpenses(expensesData.default);
        }
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  };

  const loadCalculationPeriods = async () => {
    try {
      // Try API first (backend)
      try {
        const apiPeriods = await api.getCalculationPeriods();
        setCalculationPeriods(apiPeriods);
        localStorage.setItem('calculationPeriods', JSON.stringify(apiPeriods));
        
        // Collect all used expense IDs from periods
        const usedIds = new Set();
        apiPeriods.forEach(period => {
          period.expenseIds.forEach(id => usedIds.add(id));
        });
        setUsedExpenseIds(usedIds);
      } catch (apiError) {
        console.warn('API not available, using localStorage:', apiError);
        // Fallback to localStorage
        const stored = localStorage.getItem('calculationPeriods');
        if (stored) {
          try {
            const periods = JSON.parse(stored);
            setCalculationPeriods(periods);
            
            // Collect all used expense IDs
            const usedIds = new Set();
            periods.forEach(period => {
              period.expenseIds.forEach(id => usedIds.add(id));
            });
            setUsedExpenseIds(usedIds);
          } catch (e) {
            console.error('Error loading calculation periods:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error loading calculation periods:', err);
    }
  };

  const availableExpenses = expenses.filter(exp => !usedExpenseIds.has(exp.id));
  const usedExpenses = expenses.filter(exp => usedExpenseIds.has(exp.id));

  useEffect(() => {
    if (selectedExpenses.length === 0) {
      setCalculations([]);
      setTotalExpenses(0);
      return;
    }

    const total = selectedExpenses.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0
    );
    setTotalExpenses(total);

    // Calculate distribution for each tenant
    const calcs = tenantsData.map(tenant => {
      // Common expenses (column 14)
      const commonExpenses = selectedExpenses
        .filter(exp => exp.column === 14)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      // Elevator expenses (column 12)
      const elevatorExpenses = selectedExpenses
        .filter(exp => exp.column === 12)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      // Other expenses (column 13) - also use common coefficient
      const otherExpenses = selectedExpenses
        .filter(exp => exp.column === 13)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      const commonShare = (commonExpenses * (tenant.coefficients.common || 0)) / 100;
      const elevatorShare = (elevatorExpenses * (tenant.coefficients.elevator || 0)) / 100;
      const otherShare = (otherExpenses * (tenant.coefficients.common || 0)) / 100;
      
      // Find heating data for this apartment
      const heating = heatingData.find(h => h.apartmentCode === tenant.code);
      const heatingCost = heating ? (parseFloat(heating.cost) || 0) : 0;

      const totalShare = commonShare + elevatorShare + otherShare + heatingCost;

      return {
        ...tenant,
        commonShare,
        elevatorShare,
        otherShare,
        heatingCost,
        totalShare
      };
    });

    setCalculations(calcs);
  }, [selectedExpenses]);

  const handleExpenseToggle = (expense) => {
    setSelectedExpenses(prev => {
      const isSelected = prev.some(e => e.id === expense.id);
      if (isSelected) {
        return prev.filter(e => e.id !== expense.id);
      } else {
        return [...prev, expense];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedExpenses([...availableExpenses]);
  };

  const handleDeselectAll = () => {
    setSelectedExpenses([]);
  };

  const handleSaveCalculation = async () => {
    if (!currentPeriodName.trim()) {
      alert('Παρακαλώ εισάγετε όνομα περιόδου!');
      return;
    }

    if (selectedExpenses.length === 0) {
      alert('Παρακαλώ επιλέξτε τουλάχιστον μία δαπάνη!');
      return;
    }

    const newPeriod = {
      id: Date.now(),
      name: currentPeriodName.trim(),
      date: new Date().toISOString().split('T')[0],
      expenseIds: selectedExpenses.map(e => e.id),
      totalAmount: totalExpenses,
      createdAt: new Date().toISOString()
    };

    try {
      // Try to save via API (backend)
      try {
        const savedPeriod = await api.createCalculationPeriod(newPeriod);
        
        // Update local state
        const updatedPeriods = [...calculationPeriods, savedPeriod];
        setCalculationPeriods(updatedPeriods);
        localStorage.setItem('calculationPeriods', JSON.stringify(updatedPeriods));

        // Reload expenses to get updated periodId fields
        await loadExpenses();

        // Update used expense IDs
        const newUsedIds = new Set(usedExpenseIds);
        selectedExpenses.forEach(exp => newUsedIds.add(exp.id));
        setUsedExpenseIds(newUsedIds);

        // Clear selection
        setSelectedExpenses([]);
        setCurrentPeriodName('');
        setShowPeriodForm(false);

        alert(`✅ Η περίοδος "${savedPeriod.name}" αποθηκεύτηκε επιτυχώς!\n\nΣυμπεριλήφθηκαν ${selectedExpenses.length} δαπάνες.\nΟι δαπάνες σημειώθηκαν με periodId: ${savedPeriod.id}`);
      } catch (apiError) {
        // Fallback to localStorage only
        console.warn('API save failed, using localStorage:', apiError);
        
        const updatedPeriods = [...calculationPeriods, newPeriod];
        setCalculationPeriods(updatedPeriods);
        localStorage.setItem('calculationPeriods', JSON.stringify(updatedPeriods));

        // Update used expense IDs
        const newUsedIds = new Set(usedExpenseIds);
        selectedExpenses.forEach(exp => newUsedIds.add(exp.id));
        setUsedExpenseIds(newUsedIds);

        // Clear selection
        setSelectedExpenses([]);
        setCurrentPeriodName('');
        setShowPeriodForm(false);

        alert(`⚠️ Η περίοδος "${newPeriod.name}" αποθηκεύτηκε τοπικά (backend δεν είναι διαθέσιμος)\n\nΣυμπεριλήφθηκαν ${selectedExpenses.length} δαπάνες.`);
      }
    } catch (error) {
      console.error('Error saving calculation period:', error);
      alert('Σφάλμα κατά την αποθήκευση της περιόδου. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleDeletePeriod = async (periodId) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την περίοδο;')) {
      return;
    }

    try {
      // Try to delete via API (backend)
      try {
        await api.deleteCalculationPeriod(periodId);
        
        // Reload expenses to remove periodId
        await loadExpenses();
      } catch (apiError) {
        console.warn('API delete failed, using localStorage:', apiError);
      }

      // Update local state
      const updatedPeriods = calculationPeriods.filter(p => p.id !== periodId);
      setCalculationPeriods(updatedPeriods);
      localStorage.setItem('calculationPeriods', JSON.stringify(updatedPeriods));

      // Recalculate used expense IDs
      const usedIds = new Set();
      updatedPeriods.forEach(period => {
        period.expenseIds.forEach(id => usedIds.add(id));
      });
      setUsedExpenseIds(usedIds);

      alert('Η περίοδος διαγράφηκε επιτυχώς!');
    } catch (error) {
      console.error('Error deleting period:', error);
      alert('Σφάλμα κατά τη διαγραφή της περιόδου. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const grandTotal = calculations.reduce((sum, calc) => sum + (calc.totalShare || 0), 0);

  return (
    <div className="page calculate-page">
      <h2>Υπολογισμός Κοινοχρήστων</h2>

      {/* Calculation Periods Section */}
      <div className="calculation-periods-section">
        <div className="section-header">
          <h3>Περιόδοι Υπολογισμού</h3>
          <button 
            onClick={() => setShowPeriodForm(!showPeriodForm)}
            className="btn btn-primary"
          >
            {showPeriodForm ? '✕ Ακύρωση' : '+ Νέα Περίοδος'}
          </button>
        </div>

        {showPeriodForm && (
          <div className="period-form">
            <div className="form-group">
              <label htmlFor="periodName">Όνομα Περιόδου *</label>
              <input
                type="text"
                id="periodName"
                value={currentPeriodName}
                onChange={(e) => setCurrentPeriodName(e.target.value)}
                placeholder="π.χ. Κοινόχρηστα Νοέμβριος 2025"
                className="form-input"
              />
            </div>
            <div className="form-actions">
              <button 
                onClick={handleSaveCalculation}
                className="btn btn-primary"
                disabled={!currentPeriodName.trim() || selectedExpenses.length === 0}
              >
                💾 Αποθήκευση Υπολογισμού
              </button>
            </div>
          </div>
        )}

        {calculationPeriods.length > 0 && (
          <div className="periods-list">
            <table className="periods-table">
              <thead>
                <tr>
                  <th>Όνομα Περιόδου</th>
                  <th>Ημερομηνία</th>
                  <th>Δαπάνες</th>
                  <th>Σύνολο (€)</th>
                  <th>Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {calculationPeriods.map((period) => (
                  <tr key={period.id}>
                    <td><strong>{period.name}</strong></td>
                    <td>{new Date(period.date).toLocaleDateString('el-GR')}</td>
                    <td>{period.expenseIds.length}</td>
                    <td className="amount">{period.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleDeletePeriod(period.id)}
                        className="btn btn-small"
                        style={{ background: '#dc3545' }}
                      >
                        🗑️ Διαγραφή
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Expenses Section */}
      <div className="expenses-selection-section">
        <div className="section-header">
          <h3>Διαθέσιμες Δαπάνες ({availableExpenses.length})</h3>
          <div>
            <button onClick={handleSelectAll} className="btn btn-small">
              Επιλογή Όλων
            </button>
            <button onClick={handleDeselectAll} className="btn btn-small">
              Αποεπιλογή Όλων
            </button>
          </div>
        </div>

        {availableExpenses.length === 0 ? (
          <div className="no-data">
            <p>Δεν υπάρχουν διαθέσιμες δαπάνες.</p>
            <p>Όλες οι δαπάνες έχουν συμπεριληφθεί σε προηγούμενους υπολογισμούς.</p>
          </div>
        ) : (
          <div className="expenses-checkbox-list">
            {availableExpenses.map((expense) => (
              <label key={expense.id} className="expense-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedExpenses.some(e => e.id === expense.id)}
                  onChange={() => handleExpenseToggle(expense)}
                />
                <span className="expense-info">
                  <strong>{expense.code}</strong> - {expense.description}
                  <span className="expense-amount">{parseFloat(expense.amount || 0).toFixed(2)} €</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {usedExpenses.length > 0 && (
          <div className="used-expenses-info">
            <details>
              <summary>Χρησιμοποιημένες Δαπάνες ({usedExpenses.length})</summary>
              <ul>
                {usedExpenses.map(exp => (
                  <li key={exp.id}>
                    {exp.code} - {exp.description} ({parseFloat(exp.amount || 0).toFixed(2)} €)
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>

      {/* Calculation Results */}
      {selectedExpenses.length > 0 && (
        <>
          <div className="calculation-summary">
            <div className="summary-card">
              <h3>Σύνολο Επιλεγμένων Δαπανών</h3>
              <p className="large-number">{totalExpenses.toFixed(2)} €</p>
            </div>
            <div className="summary-card">
              <h3>Σύνολο Κατανομής</h3>
              <p className="large-number">{grandTotal.toFixed(2)} €</p>
            </div>
            <div className="summary-card">
              <h3>Επιλεγμένες Δαπάνες</h3>
              <p className="large-number">{selectedExpenses.length}</p>
            </div>
          </div>

          <div className="calculations-table">
            <table className="calculation-table">
              <thead>
                <tr>
                  <th>Διαμέρισμα</th>
                  <th>Όροφος</th>
                  <th>Κοινοχρήσιμα (€)</th>
                  <th>Ανελκυστήρας (€)</th>
                  <th>Λοιπά (€)</th>
                  <th>Θέρμανση (€)</th>
                  <th>Σύνολο (€)</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => (
                  <tr key={calc.id}>
                    <td><strong>{calc.code}</strong></td>
                    <td>{calc.floor}</td>
                    <td className="amount">{calc.commonShare.toFixed(2)}</td>
                    <td className="amount">{calc.elevatorShare.toFixed(2)}</td>
                    <td className="amount">{(calc.otherShare || 0).toFixed(2)}</td>
                    <td className="amount">{calc.heatingCost.toFixed(2)}</td>
                    <td className="amount total-cell">
                      <strong>{calc.totalShare.toFixed(2)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="6"><strong>Σύνολο:</strong></td>
                  <td className="amount total-cell">
                    <strong>{grandTotal.toFixed(2)} €</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Calculate;
