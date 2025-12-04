import React, { useState, useEffect } from 'react';
import AutocompleteInput from './AutocompleteInput.jsx';

function EditExpenseModal({ expense, onClose, onSave, availableCodes, availableCategories, availableDescriptions }) {
  const [formData, setFormData] = useState({
    code: '',
    category: '',
    description: '',
    column: '14',
    amount: '',
    date: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        code: expense.code || '',
        category: expense.category || '',
        description: expense.description || '',
        column: expense.column?.toString() || '14',
        amount: expense.amount?.toString() || '',
        date: expense.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [expense]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAutocompleteChange = (name) => (e) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.column) {
      alert('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία!');
      return;
    }

    const updatedExpense = {
      ...expense,
      code: formData.code || expense.code,
      category: formData.category || '',
      description: formData.description,
      column: parseInt(formData.column),
      amount: parseFloat(formData.amount),
      date: formData.date
    };

    onSave(updatedExpense);
  };

  if (!expense) return null;

  const columnTypes = {
    '12': { name: 'Ανελκυστήρας', coefficient: 'elevator' },
    '13': { name: 'Έξοδα Κήπου/Λοιπά', coefficient: 'common' },
    '14': { name: 'Κοινοχρήσιμα', coefficient: 'common' },
    '16': { name: 'Θέρμανση', coefficient: 'heating' }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Επεξεργασία Δαπάνης</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-code">Κωδικός *</label>
              <AutocompleteInput
                value={formData.code}
                onChange={handleAutocompleteChange('code')}
                options={availableCodes}
                placeholder="π.χ. Α1, Β2"
                required={true}
                allowNew={true}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-category">Κατηγορία</label>
              <AutocompleteInput
                value={formData.category}
                onChange={handleAutocompleteChange('category')}
                options={availableCategories}
                placeholder="π.χ. Γενικά Κοινόχρηστα"
                required={false}
                allowNew={true}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Αιτιολογία Δαπάνης *</label>
            <AutocompleteInput
              value={formData.description}
              onChange={handleAutocompleteChange('description')}
              options={availableDescriptions}
              placeholder="π.χ. ΔΕΗ Κοινόχρηστων Χώρων"
              required={true}
              allowNew={true}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-column">Στήλη Χιλιοστών (Τύπος Δαπάνης) *</label>
              <select
                id="edit-column"
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
              <label htmlFor="edit-amount">Ολική Δαπάνη (€) *</label>
              <input
                type="number"
                id="edit-amount"
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
              <label htmlFor="edit-date">Ημερομηνία *</label>
              <input
                type="date"
                id="edit-date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              💾 Αποθήκευση Αλλαγών
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
            >
              Ακύρωση
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;

