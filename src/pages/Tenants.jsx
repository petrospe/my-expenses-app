import React, { useState, useEffect } from 'react';
import TenantFormModal from '../components/TenantFormModal.jsx';
import api from '../services/api.js';

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingTenant, setEditingTenant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      // Try API first (backend)
      try {
        const apiTenants = await api.getTenants();
        setTenants(apiTenants);
        localStorage.setItem('tenants', JSON.stringify(apiTenants));
      } catch (apiError) {
        console.warn('API not available, using localStorage:', apiError);
        // Fallback to localStorage
        const stored = localStorage.getItem('tenants');
        if (stored) {
          try {
            setTenants(JSON.parse(stored));
          } catch (e) {
            console.error('Error loading tenants from localStorage:', e);
            loadDefaultTenants();
          }
        } else {
          loadDefaultTenants();
        }
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
      loadDefaultTenants();
    }
  };

  const loadDefaultTenants = async () => {
    try {
      const tenantsData = await import('../data/tenants.json');
      setTenants(tenantsData.default);
    } catch (e) {
      console.error('Error loading default tenants:', e);
    }
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
  };

  const handleAddTenant = () => {
    setEditingTenant(null);
    setShowAddModal(true);
  };

  const handleSaveTenant = async (tenantData) => {
    try {
      if (editingTenant) {
        // Update existing tenant
        try {
          await api.updateTenant(editingTenant.id, tenantData);
          
          const updatedTenants = tenants.map(t => 
            t.id === editingTenant.id ? tenantData : t
          );
          setTenants(updatedTenants);
          localStorage.setItem('tenants', JSON.stringify(updatedTenants));
          
          setEditingTenant(null);
          alert('✅ Το διαμέρισμα ενημερώθηκε επιτυχώς!');
        } catch (apiError) {
          console.warn('API update failed, using localStorage:', apiError);
          
          const updatedTenants = tenants.map(t => 
            t.id === editingTenant.id ? tenantData : t
          );
          setTenants(updatedTenants);
          localStorage.setItem('tenants', JSON.stringify(updatedTenants));
          
          setEditingTenant(null);
          alert('⚠️ Το διαμέρισμα ενημερώθηκε τοπικά (backend δεν είναι διαθέσιμος)');
        }
      } else {
        // Create new tenant
        try {
          const newTenant = await api.createTenant(tenantData);
          
          const updatedTenants = [...tenants, newTenant];
          setTenants(updatedTenants);
          localStorage.setItem('tenants', JSON.stringify(updatedTenants));
          
          setShowAddModal(false);
          alert('✅ Το διαμέρισμα προστέθηκε επιτυχώς!');
        } catch (apiError) {
          console.warn('API create failed, using localStorage:', apiError);
          
          const newId = tenants.length > 0 
            ? Math.max(...tenants.map(t => t.id)) + 1 
            : 1;
          
          const newTenant = { ...tenantData, id: newId };
          const updatedTenants = [...tenants, newTenant];
          setTenants(updatedTenants);
          localStorage.setItem('tenants', JSON.stringify(updatedTenants));
          
          setShowAddModal(false);
          alert('⚠️ Το διαμέρισμα προστέθηκε τοπικά (backend δεν είναι διαθέσιμος)');
        }
      }
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('Σφάλμα κατά την αποθήκευση. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το διαμέρισμα;')) {
      return;
    }

    try {
      try {
        await api.deleteTenant(tenantId);
      } catch (apiError) {
        console.warn('API delete failed, using localStorage:', apiError);
      }

      const updatedTenants = tenants.filter(t => t.id !== tenantId);
      setTenants(updatedTenants);
      localStorage.setItem('tenants', JSON.stringify(updatedTenants));
      
      alert('Το διαμέρισμα διαγράφηκε επιτυχώς!');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Σφάλμα κατά τη διαγραφή. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

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
        <button 
          onClick={handleAddTenant}
          className="btn btn-primary"
        >
          + Προσθήκη Διαμερίσματος
        </button>
      </div>

      <div className="tenants-grid">
        {filteredTenants.map((tenant) => (
          <div key={tenant.id} className="tenant-card">
            <div className="tenant-header">
              <h3>Διαμέρισμα {tenant.code}</h3>
              <div className="tenant-header-actions">
                <span className="floor-badge">{tenant.floor}</span>
                <button
                  onClick={() => handleEditTenant(tenant)}
                  className="btn-icon"
                  title="Επεξεργασία"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteTenant(tenant.id)}
                  className="btn-icon delete-btn"
                  title="Διαγραφή"
                >
                  🗑️
                </button>
              </div>
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

      {(editingTenant || showAddModal) && (
        <TenantFormModal
          tenant={editingTenant}
          onClose={() => {
            setEditingTenant(null);
            setShowAddModal(false);
          }}
          onSave={handleSaveTenant}
          isEdit={!!editingTenant}
        />
      )}
    </div>
  );
}

export default Tenants;

