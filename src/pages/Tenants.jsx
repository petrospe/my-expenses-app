import React, { useState, useEffect } from 'react';
import tenantsData from '../data/tenants.json';

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setTenants(tenantsData);
  }, []);

  const filteredTenants = filter
    ? tenants.filter(t =>
        t.code.toLowerCase().includes(filter.toLowerCase()) ||
        t.owner.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.tenant.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.floor.toLowerCase().includes(filter.toLowerCase())
      )
    : tenants;

  return (
    <div className="page tenants-page">
      <h2>Διαχείριση Διαμερισμάτων</h2>
      
      <div className="page-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Αναζήτηση διαμερισμάτων..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="summary-box">
          <strong>Σύνολο: {filteredTenants.length} διαμερίσματα</strong>
        </div>
      </div>

      <div className="tenants-grid">
        {filteredTenants.map((tenant) => (
          <div key={tenant.id} className="tenant-card">
            <div className="tenant-header">
              <h3>Διαμέρισμα {tenant.code}</h3>
              <span className="floor-badge">{tenant.floor}</span>
            </div>
            
            <div className="tenant-details">
              <div className="detail-section">
                <h4>Ιδιοκτήτης</h4>
                <p><strong>Όνομα:</strong> {tenant.owner.name}</p>
                {tenant.owner.phone && <p><strong>Τηλέφωνο:</strong> {tenant.owner.phone}</p>}
                {tenant.owner.mobile && <p><strong>Κινητό:</strong> {tenant.owner.mobile}</p>}
              </div>
              
              <div className="detail-section">
                <h4>Ένοικος</h4>
                <p><strong>Όνομα:</strong> {tenant.tenant.name}</p>
                {tenant.tenant.phone && <p><strong>Τηλέφωνο:</strong> {tenant.tenant.phone}</p>}
                {tenant.tenant.mobile && <p><strong>Κινητό:</strong> {tenant.tenant.mobile}</p>}
              </div>
              
              <div className="detail-section">
                <h4>Στοιχεία</h4>
                <p><strong>Εμβαδόν:</strong> {tenant.area} m²</p>
              </div>
              
              <div className="detail-section">
                <h4>Συντελεστές</h4>
                <div className="coefficients">
                  <span>Ανελκυστήρας: {parseFloat(tenant.coefficients.elevator || 0).toFixed(2)}%</span>
                  <span>Θέρμανση: {parseFloat(tenant.coefficients.heating || 0).toFixed(2)}%</span>
                  <span>Κοινοχρήσιμα: {parseFloat(tenant.coefficients.common || 0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tenants;

