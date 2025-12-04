import React, { useState, useEffect } from 'react';
import buildingData from '../data/building.json';
import expensesData from '../data/expenses.json';
import tenantsData from '../data/tenants.json';

function Home() {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalTenants: 0,
    buildingInfo: null
  });

  useEffect(() => {
    const totalExpenses = expensesData.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0
    );

    setStats({
      totalExpenses,
      totalTenants: tenantsData.length,
      buildingInfo: buildingData
    });
  }, []);

  return (
    <div className="page home-page">
      <h2>Αρχική Σελίδα</h2>
      
      <div className="welcome-section">
        <h3>Καλώς ήρθατε στο Σύστημα Διαχείρισης Κοινοχρήστων</h3>
        
        {stats.buildingInfo && (
          <div className="building-info">
            <p><strong>Διεύθυνση:</strong> {stats.buildingInfo.address || 'Δεν έχει οριστεί'}</p>
            {stats.buildingInfo.manager && (
              <p><strong>Διαχειριστής:</strong> {stats.buildingInfo.manager}</p>
            )}
            {stats.buildingInfo.processor && (
              <p><strong>Επεξεργασία:</strong> {stats.buildingInfo.processor}</p>
            )}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Σύνολο Δαπανών</h4>
          <p className="stat-value">{stats.totalExpenses.toFixed(2)} €</p>
        </div>
        
        <div className="stat-card">
          <h4>Διαμερίσματα</h4>
          <p className="stat-value">{stats.totalTenants}</p>
        </div>
        
        <div className="stat-card">
          <h4>Καταχωρημένες Δαπάνες</h4>
          <p className="stat-value">{expensesData.length}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Γρήγορες Ενέργειες</h3>
        <ul>
          <li>Προβολή όλων των δαπανών από το μενού "Δαπάνες"</li>
          <li>Διαχείριση διαμερισμάτων από το μενού "Διαμερίσματα"</li>
          <li>Υπολογισμός κοινοχρήστων από το μενού "Υπολογισμός"</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;

