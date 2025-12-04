import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tenantsData from '../data/tenants.json';
import AutocompleteInput from '../components/AutocompleteInput.jsx';
import api from '../services/api.js';

function AddExpense() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    category: '',
    description: '',
    column: '14', // Default to common expenses
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [distribution, setDistribution] = useState([]);
  const [showDistribution, setShowDistribution] = useState(false);
  const [saved, setSaved] = useState(false);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [availableDescriptions, setAvailableDescriptions] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Column types mapping
  const columnTypes = {
    '12': { name: 'Ανελκυστήρας', coefficient: 'elevator' },
    '13': { name: 'Έξοδα Κήπου/Λοιπά', coefficient: 'common' },
    '14': { name: 'Κοινοχρήσιμα', coefficient: 'common' },
    '16': { name: 'Θέρμανση', coefficient: 'heating' }
  };

  useEffect(() => {
    // Load existing expenses
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
            const parsed = JSON.parse(stored);
            setExpenses(parsed);
            extractUniqueValues(parsed);
          } else {
            // Final fallback to JSON file
            const expensesData = await import('../data/expenses.json');
            setExpenses(expensesData.default);
            extractUniqueValues(expensesData.default);
          }
        }
      } catch (err) {
        console.error('Error loading expenses:', err);
        // Final fallback
        import('../data/expenses.json').then(module => {
          setExpenses(module.default);
          extractUniqueValues(module.default);
        });
      }
    };

    loadExpenses();

    // Listen for storage changes
    const handleStorageChange = () => {
      const stored = localStorage.getItem('expenses');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setExpenses(parsed);
          extractUniqueValues(parsed);
        } catch (e) {
          console.error('Error loading expenses:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const extractUniqueValues = (expensesList) => {
    // Extract unique codes
    const codes = [...new Set(expensesList.map(exp => exp.code).filter(Boolean))].sort();
    setAvailableCodes(codes);

    // Extract unique descriptions
    const descriptions = [...new Set(expensesList.map(exp => exp.description).filter(Boolean))].sort();
    setAvailableDescriptions(descriptions);

    // Extract unique categories
    const categories = [...new Set(expensesList.map(exp => exp.category).filter(Boolean))].sort();
    setAvailableCategories(categories);
  };

  useEffect(() => {
    // Calculate distribution when amount or column changes
    if (formData.amount && formData.column) {
      calculateDistribution();
    } else {
      setDistribution([]);
      setShowDistribution(false);
    }
  }, [formData.amount, formData.column]);

  const calculateDistribution = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setDistribution([]);
      return;
    }

    const columnType = columnTypes[formData.column];
    if (!columnType) {
      setDistribution([]);
      return;
    }

    const coefficientType = columnType.coefficient;
    const dist = tenantsData.map(tenant => {
      const coefficient = tenant.coefficients[coefficientType] || 0;
      const share = (amount * coefficient) / 100;
      
      return {
        id: tenant.id,
        code: tenant.code,
        owner: tenant.owner.name,
        tenant: tenant.tenant.name,
        coefficient: coefficient,
        share: share,
        percentage: coefficient
      };
    });

    setDistribution(dist);
    setShowDistribution(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.column) {
      alert('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία!');
      return;
    }

    try {
      const newExpense = {
        code: formData.code || '',
        category: formData.category || '',
        description: formData.description,
        column: parseInt(formData.column),
        amount: parseFloat(formData.amount),
        date: formData.date
      };

      // Try to save via API (backend)
      try {
        const savedExpense = await api.createExpense(newExpense);
        
        // Update local state
        const updatedExpenses = [...expenses, savedExpense];
        setExpenses(updatedExpenses);
        extractUniqueValues(updatedExpenses);
        
        // Also update localStorage for offline support
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        
        setSaved(true);
        
        alert(`✅ Η δαπάνη αποθηκεύτηκε επιτυχώς!\n\nΚωδικός: ${savedExpense.code}\nΠοσό: ${savedExpense.amount.toFixed(2)} €\nΣύνολο κατανομής: ${distribution.reduce((sum, d) => sum + d.share, 0).toFixed(2)} €`);
      } catch (apiError) {
        // Fallback to localStorage if API fails
        console.warn('API save failed, using localStorage:', apiError);
        
        const newId = expenses.length > 0 
          ? Math.max(...expenses.map(e => e.id)) + 1 
          : 1;

        const expenseWithId = {
          ...newExpense,
          id: newId
        };

        const updatedExpenses = [...expenses, expenseWithId];
        setExpenses(updatedExpenses);
        extractUniqueValues(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        setSaved(true);
        
        alert(`⚠️ Η δαπάνη αποθηκεύτηκε τοπικά (backend δεν είναι διαθέσιμος)\n\nΚωδικός: ${expenseWithId.code}\nΠοσό: ${expenseWithId.amount.toFixed(2)} €`);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          code: '',
          category: '',
          description: '',
          column: '14',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        });
        setDistribution([]);
        setShowDistribution(false);
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Σφάλμα κατά την αποθήκευση της δαπάνης. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const totalDistribution = distribution.reduce((sum, d) => sum + d.share, 0);
  const totalAmount = parseFloat(formData.amount) || 0;
  const difference = Math.abs(totalAmount - totalDistribution);

  return (
    <div className="page add-expense-page">
      <h2>Προσθήκη Νέας Δαπάνης</h2>

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="code">Κωδικός *</label>
            <AutocompleteInput
              value={formData.code}
              onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'code' } })}
              options={availableCodes}
              placeholder="π.χ. Α1, Β2"
              required={true}
              allowNew={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Κατηγορία</label>
            <AutocompleteInput
              value={formData.category}
              onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'category' } })}
              options={availableCategories}
              placeholder="π.χ. Γενικά Κοινόχρηστα"
              required={false}
              allowNew={true}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Αιτιολογία Δαπάνης *</label>
          <AutocompleteInput
            value={formData.description}
            onChange={(e) => handleInputChange({ ...e, target: { ...e.target, name: 'description' } })}
            options={availableDescriptions}
            placeholder="π.χ. ΔΕΗ Κοινόχρηστων Χώρων"
            required={true}
            allowNew={true}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="column">Στήλη Χιλιοστών (Τύπος Δαπάνης) *</label>
            <select
              id="column"
              name="column"
              value={formData.column}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="14">14 - Κοινοχρήσιμα (Συντελ. Κοινοχρήσιμα)</option>
              <option value="12">12 - Ανελκυστήρας (Συντελ. Ανελκυστήρας)</option>
              <option value="13">13 - Έξοδα Κήπου/Λοιπά (Συντελ. Κοινοχρήσιμα)</option>
              <option value="16">16 - Θέρμανση (Συντελ. Θέρμανση)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Ολική Δαπάνη (€) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Ημερομηνία *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {showDistribution && distribution.length > 0 && (
          <div className="distribution-preview">
            <h3>Προεπισκόπηση Κατανομής</h3>
            <div className="distribution-summary">
              <p>
                <strong>Τύπος:</strong> {columnTypes[formData.column].name}
              </p>
              <p>
                <strong>Σύνολο Δαπάνης:</strong> {totalAmount.toFixed(2)} €
              </p>
              <p>
                <strong>Σύνολο Κατανομής:</strong> {totalDistribution.toFixed(2)} €
              </p>
              {difference > 0.01 && (
                <p className="warning">
                  ⚠️ Διαφορά: {difference.toFixed(2)} € (μπορεί να οφείλεται σε στρογγυλοποίηση)
                </p>
              )}
            </div>
            <div className="distribution-table-container">
              <table className="distribution-table">
                <thead>
                  <tr>
                    <th>Διαμέρισμα</th>
                    <th>Ιδιοκτήτης</th>
                    <th>Συντελεστής (%)</th>
                    <th>Μερίδιο (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.map((dist) => (
                    <tr key={dist.id}>
                      <td><strong>{dist.code}</strong></td>
                      <td>{dist.owner}</td>
                      <td className="amount">{dist.coefficient.toFixed(2)}%</td>
                      <td className="amount">{dist.share.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="2"><strong>Σύνολο:</strong></td>
                    <td className="amount"><strong>100.00%</strong></td>
                    <td className="amount"><strong>{totalDistribution.toFixed(2)} €</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saved}>
            {saved ? '✓ Αποθηκεύτηκε!' : 'Αποθήκευση Δαπάνης'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/expenses')}
            className="btn btn-secondary"
          >
            Ακύρωση
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;




