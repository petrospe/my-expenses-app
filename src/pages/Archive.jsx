import React, { useState, useEffect } from 'react';
import expensesData from '../data/expenses.json';
import tenantsData from '../data/tenants.json';
import heatingData from '../data/heating.json';
import buildingData from '../data/building.json';

function Archive() {
  const [archives, setArchives] = useState([]);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [archiveData, setArchiveData] = useState(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = () => {
    // Load archived months from localStorage or API
    const stored = localStorage.getItem('monthlyArchives');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setArchives(parsed.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (e) {
        console.error('Error loading archives:', e);
      }
    }
  };

  const createArchive = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const archiveKey = `${year}-${month}`;
    const archiveDate = `${year}-${month}-${String(now.getDate()).padStart(2, '0')}`;

    const archive = {
      id: archiveKey,
      date: archiveDate,
      year,
      month: parseInt(month),
      monthName: now.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' }),
      expenses: expensesData,
      tenants: tenantsData,
      heating: heatingData,
      building: buildingData,
      totalExpenses: expensesData.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0),
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const existing = localStorage.getItem('monthlyArchives');
    let archivesList = [];
    if (existing) {
      try {
        archivesList = JSON.parse(existing);
      } catch (e) {
        console.error('Error parsing existing archives:', e);
      }
    }

    // Remove duplicate if exists
    archivesList = archivesList.filter(a => a.id !== archiveKey);
    archivesList.push(archive);

    localStorage.setItem('monthlyArchives', JSON.stringify(archivesList));
    localStorage.setItem(`archive_${archiveKey}`, JSON.stringify(archive));

    loadArchives();
    alert(`Αρχειοθέτηση για ${archive.monthName} ολοκληρώθηκε!`);
  };

  const loadArchiveData = (archiveId) => {
    const stored = localStorage.getItem(`archive_${archiveId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setArchiveData(data);
        setSelectedArchive(archiveId);
      } catch (e) {
        console.error('Error loading archive data:', e);
      }
    }
  };

  const exportArchive = (archiveId, format = 'json') => {
    const stored = localStorage.getItem(`archive_${archiveId}`);
    if (!stored) {
      alert('Αρχείο δεν βρέθηκε!');
      return;
    }

    const data = JSON.parse(stored);
    const archive = archives.find(a => a.id === archiveId);
    const filename = `archive_${archiveId}_${archive?.monthName || archiveId}.${format}`;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // For Excel export, we'll create a CSV-like structure
      // In a real app, you'd use a library like xlsx
      alert('Excel export requires xlsx library. JSON export available.');
    }
  };

  const exportAllArchives = () => {
    const allArchives = archives.map(arch => {
      const stored = localStorage.getItem(`archive_${arch.id}`);
      return stored ? JSON.parse(stored) : null;
    }).filter(Boolean);

    const blob = new Blob([JSON.stringify(allArchives, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_archives_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page archive-page">
      <h2>Αρχειοθέτηση & Εξαγωγή Δεδομένων</h2>

      <div className="archive-controls">
        <button onClick={createArchive} className="btn btn-primary">
          Αρχειοθέτηση Τρέχοντος Μήνα
        </button>
        {archives.length > 0 && (
          <button onClick={exportAllArchives} className="btn btn-secondary">
            Εξαγωγή Όλων των Αρχείων (JSON)
          </button>
        )}
      </div>

      {archives.length === 0 ? (
        <div className="no-archives">
          <p>Δεν υπάρχουν αρχειοθετημένοι μήνες.</p>
          <p>Κάντε κλικ στο "Αρχειοθέτηση Τρέχοντος Μήνα" για να δημιουργήσετε το πρώτο αρχείο.</p>
        </div>
      ) : (
        <>
          <div className="archives-list">
            <h3>Αρχειοθετημένοι Μήνες ({archives.length})</h3>
            <table className="archive-table">
              <thead>
                <tr>
                  <th>Μήνας</th>
                  <th>Ημερομηνία Αρχειοθέτησης</th>
                  <th>Σύνολο Δαπανών</th>
                  <th>Διαμερίσματα</th>
                  <th>Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {archives.map((archive) => (
                  <tr 
                    key={archive.id}
                    className={selectedArchive === archive.id ? 'selected' : ''}
                  >
                    <td><strong>{archive.monthName}</strong></td>
                    <td>{new Date(archive.createdAt).toLocaleDateString('el-GR')}</td>
                    <td className="amount">{archive.totalExpenses.toFixed(2)} €</td>
                    <td>{archive.tenants.length}</td>
                    <td>
                      <button 
                        onClick={() => loadArchiveData(archive.id)}
                        className="btn btn-small"
                      >
                        Προβολή
                      </button>
                      <button 
                        onClick={() => exportArchive(archive.id, 'json')}
                        className="btn btn-small"
                      >
                        Εξαγωγή JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {archiveData && selectedArchive && (
            <div className="archive-details">
              <h3>Λεπτομέρειες Αρχείου: {archiveData.monthName}</h3>
              <div className="archive-stats">
                <div className="stat-box">
                  <h4>Σύνολο Δαπανών</h4>
                  <p className="stat-value">{archiveData.totalExpenses.toFixed(2)} €</p>
                </div>
                <div className="stat-box">
                  <h4>Αριθμός Δαπανών</h4>
                  <p className="stat-value">{archiveData.expenses.length}</p>
                </div>
                <div className="stat-box">
                  <h4>Διαμερίσματα</h4>
                  <p className="stat-value">{archiveData.tenants.length}</p>
                </div>
                <div className="stat-box">
                  <h4>Ημερομηνία</h4>
                  <p className="stat-value">{new Date(archiveData.createdAt).toLocaleDateString('el-GR')}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Archive;








