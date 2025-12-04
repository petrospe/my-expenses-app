import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

function ViewLocalStorage() {
  const [expenses, setExpenses] = useState([]);
  const [jsonOutput, setJsonOutput] = useState('');
  const [apiAvailable, setApiAvailable] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadExpenses();
    checkApi();
  }, []);

  const checkApi = async () => {
    try {
      await api.healthCheck();
      setApiAvailable(true);
    } catch (e) {
      setApiAvailable(false);
    }
  };

  const loadExpenses = () => {
    const stored = localStorage.getItem('expenses');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setExpenses(parsed);
        setJsonOutput(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('Error parsing expenses:', e);
      }
    }
  };

  const syncToBackend = async () => {
    if (!apiAvailable) {
      alert('Backend API δεν είναι διαθέσιμος. Εκκινήστε τον server με: npm run dev:backend');
      return;
    }

    setSyncing(true);
    try {
      await api.syncExpenses(expenses);
      alert(`✅ Συγχρονίστηκαν ${expenses.length} δαπάνες στο backend!`);
      // Reload from API
      const apiExpenses = await api.getExpenses();
      setExpenses(apiExpenses);
      setJsonOutput(JSON.stringify(apiExpenses, null, 2));
      localStorage.setItem('expenses', JSON.stringify(apiExpenses));
    } catch (error) {
      console.error('Sync error:', error);
      alert('Σφάλμα κατά τη συγχρονισμό. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setSyncing(false);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput).then(() => {
      alert('JSON copied to clipboard!');
    });
  };

  return (
    <div className="page">
      <h2>Προβολή & Εξαγωγή Δαπανών</h2>
      
      <div className={`localstorage-info ${apiAvailable ? 'api-available' : 'api-unavailable'}`}>
        <p><strong>Σύνολο Δαπανών:</strong> {expenses.length}</p>
        <p><strong>Τοποθεσία:</strong> Browser LocalStorage</p>
        <p><strong>Backend API:</strong> {apiAvailable ? '✅ Διαθέσιμος' : '❌ Μη διαθέσιμος'}</p>
        {!apiAvailable && (
          <p className="help-text">
            💡 Για να ενεργοποιήσετε το backend, εκτελέστε: <code>npm run dev:backend</code>
          </p>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="no-data">
          <p>Δεν υπάρχουν δαπάνες στο localStorage.</p>
          <p>Προσθέστε δαπάνες από τη σελίδα "Προσθήκη Δαπάνης".</p>
        </div>
      ) : (
        <>
          <div className="actions-bar">
            {apiAvailable && (
              <button 
                onClick={syncToBackend} 
                className="btn btn-primary"
                disabled={syncing}
              >
                {syncing ? '⏳ Συγχρονισμός...' : '🔄 Συγχρονισμός με Backend'}
              </button>
            )}
            <button onClick={downloadJSON} className="btn btn-secondary">
              📥 Κατέβασμα JSON
            </button>
            <button onClick={copyToClipboard} className="btn btn-secondary">
              📋 Αντιγραφή JSON
            </button>
            <button onClick={loadExpenses} className="btn btn-secondary">
              🔄 Ανανέωση
            </button>
          </div>

          <div className="expenses-list">
            <h3>Δαπάνες ({expenses.length})</h3>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Κωδικός</th>
                  <th>Κατηγορία</th>
                  <th>Περιγραφή</th>
                  <th>Στήλη</th>
                  <th>Ποσό (€)</th>
                  <th>Ημερομηνία</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.id}</td>
                    <td>{exp.code}</td>
                    <td>{exp.category || '-'}</td>
                    <td>{exp.description}</td>
                    <td>{exp.column}</td>
                    <td className="amount">{parseFloat(exp.amount || 0).toFixed(2)}</td>
                    <td>{exp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="json-viewer">
            <h3>JSON Output</h3>
            <textarea
              readOnly
              value={jsonOutput}
              className="json-textarea"
              rows={20}
            />
            <p className="help-text">
              {apiAvailable 
                ? 'Κάντε κλικ στο "Συγχρονισμός με Backend" για να αποθηκεύσετε αυτόματα στο JSON αρχείο.'
                : 'Μπορείτε να αντιγράψετε αυτό το JSON και να το αποθηκεύσετε στο αρχείο src/data/expenses.json'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewLocalStorage;
