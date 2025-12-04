import React, { useState, useEffect } from 'react';

function TenantFormModal({ tenant, onClose, onSave, isEdit = false }) {
  const [formData, setFormData] = useState({
    code: '',
    floor: '',
    area: '',
    owner: {
      name: '',
      phone: '',
      mobile: ''
    },
    tenant: {
      name: '',
      phone: '',
      mobile: ''
    },
    coefficients: {
      elevator: 0,
      heating: 0,
      common: 0,
      fi: 0,
      emergency: 0,
      ei: 0
    }
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        code: tenant.code || '',
        floor: tenant.floor || '',
        area: tenant.area || '',
        owner: {
          name: tenant.owner?.name || '',
          phone: tenant.owner?.phone || '',
          mobile: tenant.owner?.mobile || ''
        },
        tenant: {
          name: tenant.tenant?.name || '',
          phone: tenant.tenant?.phone || '',
          mobile: tenant.tenant?.mobile || ''
        },
        coefficients: {
          elevator: tenant.coefficients?.elevator || 0,
          heating: tenant.coefficients?.heating || 0,
          common: tenant.coefficients?.common || 0,
          fi: tenant.coefficients?.fi || 0,
          emergency: tenant.coefficients?.emergency || 0,
          ei: tenant.coefficients?.ei || 0
        }
      });
    }
  }, [tenant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('owner.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        owner: { ...prev.owner, [field]: value }
      }));
    } else if (name.startsWith('tenant.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        tenant: { ...prev.tenant, [field]: value }
      }));
    } else if (name.startsWith('coefficients.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coefficients: { ...prev.coefficients, [field]: parseFloat(value) || 0 }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.owner.name) {
      alert('Παρακαλώ συμπληρώστε τουλάχιστον τον Κωδικό και το Όνομα Ιδιοκτήτη!');
      return;
    }

    const tenantData = {
      ...formData,
      area: parseFloat(formData.area) || 0,
      coefficients: {
        elevator: parseFloat(formData.coefficients.elevator) || 0,
        heating: parseFloat(formData.coefficients.heating) || 0,
        common: parseFloat(formData.coefficients.common) || 0,
        fi: parseFloat(formData.coefficients.fi) || 0,
        emergency: parseFloat(formData.coefficients.emergency) || 0,
        ei: parseFloat(formData.coefficients.ei) || 0
      }
    };

    if (isEdit && tenant) {
      tenantData.id = tenant.id;
    }

    onSave(tenantData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tenant-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Επεξεργασία Διαμερίσματος' : 'Προσθήκη Νέου Διαμερίσματος'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="tenant-form">
          <div className="form-section">
            <h3>Βασικά Στοιχεία</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code">Κωδικός Διαμερίσματος *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="π.χ. Κ1, Α1, Β2"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="floor">Όροφος</label>
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  placeholder="π.χ. Ισ, 1ος, 2ος"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="area">Εμβαδόν (m²)</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ιδιοκτήτης</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="owner.name">Όνομα *</label>
                <input
                  type="text"
                  id="owner.name"
                  name="owner.name"
                  value={formData.owner.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner.phone">Τηλέφωνο</label>
                <input
                  type="text"
                  id="owner.phone"
                  name="owner.phone"
                  value={formData.owner.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner.mobile">Κινητό</label>
                <input
                  type="text"
                  id="owner.mobile"
                  name="owner.mobile"
                  value={formData.owner.mobile}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ένοικος</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tenant.name">Όνομα</label>
                <input
                  type="text"
                  id="tenant.name"
                  name="tenant.name"
                  value={formData.tenant.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenant.phone">Τηλέφωνο</label>
                <input
                  type="text"
                  id="tenant.phone"
                  name="tenant.phone"
                  value={formData.tenant.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenant.mobile">Κινητό</label>
                <input
                  type="text"
                  id="tenant.mobile"
                  name="tenant.mobile"
                  value={formData.tenant.mobile}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Συντελεστές Κατανομής (‰)</h3>
            <div className="coefficients-grid">
              <div className="form-group">
                <label htmlFor="coefficients.common">Κοινοχρήστων - Δαπάνη Α (‰)</label>
                <input
                  type="number"
                  id="coefficients.common"
                  name="coefficients.common"
                  value={formData.coefficients.common}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coefficients.elevator">Ανελκυστήρα - Δαπάνη Β (‰)</label>
                <input
                  type="number"
                  id="coefficients.elevator"
                  name="coefficients.elevator"
                  value={formData.coefficients.elevator}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coefficients.heating">Θέρμανσης - Δαπάνη Γ (‰)</label>
                <input
                  type="number"
                  id="coefficients.heating"
                  name="coefficients.heating"
                  value={formData.coefficients.heating}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coefficients.fi">fi (Συντελεστής)</label>
                <input
                  type="number"
                  id="coefficients.fi"
                  name="coefficients.fi"
                  value={formData.coefficients.fi}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coefficients.ei">ei (Συντελεστής)</label>
                <input
                  type="number"
                  id="coefficients.ei"
                  name="coefficients.ei"
                  value={formData.coefficients.ei}
                  onChange={handleInputChange}
                  step="0.0001"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coefficients.emergency">Έκτακτα (‰)</label>
                <input
                  type="number"
                  id="coefficients.emergency"
                  name="coefficients.emergency"
                  value={formData.coefficients.emergency}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              💾 {isEdit ? 'Αποθήκευση Αλλαγών' : 'Προσθήκη Διαμερίσματος'}
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

export default TenantFormModal;

