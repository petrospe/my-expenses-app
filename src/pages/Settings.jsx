import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import tenantsData from '../data/tenants.json';

function Settings() {
  const [tenants, setTenants] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedTenantId, setSavedTenantId] = useState(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      try {
        const apiTenants = await api.getTenants();
        setTenants(apiTenants);
        localStorage.setItem('tenants', JSON.stringify(apiTenants));
      } catch (apiError) {
        console.warn('API not available, using localStorage:', apiError);
        const stored = localStorage.getItem('tenants');
        if (stored) {
          try {
            setTenants(JSON.parse(stored));
          } catch (e) {
            console.error('Error loading tenants from localStorage:', e);
            setTenants(tenantsData);
          }
        } else {
          setTenants(tenantsData);
        }
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
      setTenants(tenantsData);
    } finally {
      setLoading(false);
    }
  };

  const handleFactorChange = (tenantId, factorName, value) => {
    setTenants(prevTenants =>
      prevTenants.map(tenant =>
        tenant.id === tenantId
          ? {
              ...tenant,
              coefficients: {
                ...tenant.coefficients,
                [factorName]: parseFloat(value) || 0
              }
            }
          : tenant
      )
    );
    setSavedTenantId(null);
  };

  const handleSaveTenant = async (tenant) => {
    try {
      setSaving(true);
      const tenantData = {
        ...tenant,
        coefficients: {
          common: parseFloat(tenant.coefficients.common) || 0,
          elevator: parseFloat(tenant.coefficients.elevator) || 0,
          heating: parseFloat(tenant.coefficients.heating) || 0,
          equal: parseFloat(tenant.coefficients.equal) || 0,
          fi: parseFloat(tenant.coefficients.fi) || 0,
          ei: parseFloat(tenant.coefficients.ei) || 0,
          emergency: parseFloat(tenant.coefficients.emergency) || 0
        }
      };

      try {
        await api.updateTenant(tenant.id, tenantData);
        
        const updatedTenants = tenants.map(t =>
          t.id === tenant.id ? tenantData : t
        );
        setTenants(updatedTenants);
        localStorage.setItem('tenants', JSON.stringify(updatedTenants));
        
        setSavedTenantId(tenant.id);
        setTimeout(() => setSavedTenantId(null), 2000);
      } catch (apiError) {
        console.warn('API save failed, using localStorage:', apiError);
        
        const updatedTenants = tenants.map(t =>
          t.id === tenant.id ? tenantData : t
        );
        setTenants(updatedTenants);
        localStorage.setItem('tenants', JSON.stringify(updatedTenants));
        
        setSavedTenantId(tenant.id);
        setTimeout(() => setSavedTenantId(null), 2000);
        alert('⚠️ Οι συντελεστές αποθηκεύτηκαν τοπικά (backend δεν είναι διαθέσιμος)');
      }
    } catch (error) {
      console.error('Error saving tenant factors:', error);
      alert('Σφάλμα κατά την αποθήκευση. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setSaving(false);
    }
  };

  const handleFillEqual = () => {
    if (filteredTenants.length === 0) {
      alert('Δεν υπάρχουν διαμερίσματα για συμπλήρωση!');
      return;
    }

    const equalValue = 1000 / filteredTenants.length;
    
    if (!confirm(`Θέλετε να συμπληρώσετε τη στήλη "Ίσος" με ${equalValue.toFixed(4)} ‰ για όλα τα ${filteredTenants.length} διαμερίσματα;`)) {
      return;
    }

    setTenants(prevTenants =>
      prevTenants.map(tenant => {
        // Only update if tenant is in filtered list
        const isInFiltered = filteredTenants.some(t => t.id === tenant.id);
        if (isInFiltered) {
          return {
            ...tenant,
            coefficients: {
              ...tenant.coefficients,
              equal: equalValue
            }
          };
        }
        return tenant;
      })
    );

    alert(`✅ Συμπληρώθηκε η στήλη "Ίσος" με ${equalValue.toFixed(4)} ‰ για ${filteredTenants.length} διαμερίσματα!`);
  };

  const handleSaveAll = async () => {
    // Validate column sums
    const invalidColumns = [];
    Object.keys(columnSums).forEach(factorName => {
      if (!isColumnValid(columnSums[factorName])) {
        const factorLabels = {
          common: 'Κοινοχρήστων',
          elevator: 'Ανελκυστήρας',
          heating: 'Θέρμανση',
          equal: 'Ίσος'
        };
        invalidColumns.push(`${factorLabels[factorName]} (${columnSums[factorName].toFixed(2)} ‰)`);
      }
    });

    if (invalidColumns.length > 0) {
      alert(`⚠️ Προειδοποίηση: Οι ακόλουθες στήλες δεν αθροίζουν σε 1000 ‰:\n\n${invalidColumns.join('\n')}\n\nΘέλετε να συνεχίσετε;`);
      if (!confirm('Συνεχίσετε με την αποθήκευση;')) {
        return;
      }
    } else if (!confirm('Είστε σίγουροι ότι θέλετε να αποθηκεύσετε όλους τους συντελεστές;')) {
      return;
    }

    try {
      setSaving(true);
      let successCount = 0;
      let failCount = 0;

      for (const tenant of tenants) {
        try {
          const tenantData = {
            ...tenant,
            coefficients: {
              common: parseFloat(tenant.coefficients.common) || 0,
              elevator: parseFloat(tenant.coefficients.elevator) || 0,
              heating: parseFloat(tenant.coefficients.heating) || 0,
              equal: parseFloat(tenant.coefficients.equal) || 0,
              fi: parseFloat(tenant.coefficients.fi) || 0,
              ei: parseFloat(tenant.coefficients.ei) || 0,
              emergency: parseFloat(tenant.coefficients.emergency) || 0
            }
          };

          try {
            await api.updateTenant(tenant.id, tenantData);
            successCount++;
          } catch (apiError) {
            // Continue with localStorage fallback
            successCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      localStorage.setItem('tenants', JSON.stringify(tenants));
      alert(`✅ Αποθηκεύτηκαν ${successCount} διαμερίσματα${failCount > 0 ? `, ${failCount} απέτυχαν` : ''}`);
    } catch (error) {
      console.error('Error saving all tenants:', error);
      alert('Σφάλμα κατά την αποθήκευση. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setSaving(false);
    }
  };

  const filteredTenants = filter
    ? tenants.filter(t =>
        t.code.toLowerCase().includes(filter.toLowerCase()) ||
        t.owner.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.floor.toLowerCase().includes(filter.toLowerCase())
      )
    : tenants;

  // Calculate column sums
  const calculateColumnSum = (factorName) => {
    return filteredTenants.reduce((sum, tenant) => {
      return sum + (parseFloat(tenant.coefficients?.[factorName]) || 0);
    }, 0);
  };

  const columnSums = {
    common: calculateColumnSum('common'),
    elevator: calculateColumnSum('elevator'),
    heating: calculateColumnSum('heating'),
    equal: calculateColumnSum('equal')
  };

  const isColumnValid = (sum) => {
    return Math.abs(sum - 1000) < 0.01; // Allow small floating point differences
  };

  if (loading) {
    return (
      <div className="page settings-page">
        <h2>Συντελεστές Κατανομής ανά Διαμέρισμα</h2>
        <p>Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="page settings-page">
      <h2>Συντελεστές Κατανομής ανά Διαμέρισμα</h2>
      
      <div className="settings-section">
        <div className="settings-info">
          <p>Συμπληρώστε τους συντελεστές κατανομής για κάθε διαμέρισμα ως ποσοστά του χιλίων (‰).</p>
          <p><strong>Σημαντικό:</strong> Κάθε στήλη (συντελεστής) πρέπει να αθροίζει σε <strong>1000 ‰</strong>.</p>
        </div>

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
            onClick={handleFillEqual}
            className="btn btn-secondary"
            disabled={filteredTenants.length === 0}
            title={`Συμπλήρωση "Ίσος" με ${filteredTenants.length > 0 ? (1000 / filteredTenants.length).toFixed(4) : '0'} ‰`}
          >
            ⚖️ Συμπλήρωση "Ίσος" (1000/{filteredTenants.length || 'N'})
          </button>
          <button
            onClick={handleSaveAll}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Αποθήκευση...' : '💾 Αποθήκευση Όλων'}
          </button>
        </div>

        <div className="factors-table-container">
          <table className="factors-table">
            <thead>
              <tr>
                <th>Διαμέρισμα</th>
                <th>Όροφος</th>
                <th>Κοινοχρήστων (‰)</th>
                <th>Ανελκυστήρας (‰)</th>
                <th>Θέρμανση (‰)</th>
                <th>Ίσος (‰)</th>
                <th>Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className={savedTenantId === tenant.id ? 'saved-row' : ''}>
                  <td><strong>{tenant.code}</strong></td>
                  <td>{tenant.floor}</td>
                  <td>
                    <input
                      type="number"
                      value={tenant.coefficients?.common || 0}
                      onChange={(e) => handleFactorChange(tenant.id, 'common', e.target.value)}
                      step="0.01"
                      min="0"
                      className="factor-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tenant.coefficients?.elevator || 0}
                      onChange={(e) => handleFactorChange(tenant.id, 'elevator', e.target.value)}
                      step="0.01"
                      min="0"
                      className="factor-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tenant.coefficients?.heating || 0}
                      onChange={(e) => handleFactorChange(tenant.id, 'heating', e.target.value)}
                      step="0.01"
                      min="0"
                      className="factor-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={tenant.coefficients?.equal || 0}
                      onChange={(e) => handleFactorChange(tenant.id, 'equal', e.target.value)}
                      step="0.01"
                      min="0"
                      className="factor-input"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleSaveTenant(tenant)}
                      className="btn btn-small"
                      disabled={saving && savedTenantId !== tenant.id}
                      title="Αποθήκευση"
                    >
                      {savedTenantId === tenant.id ? '✅' : '💾'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="column-sum-row">
                <td colSpan="2"><strong>Σύνολο:</strong></td>
                <td className={isColumnValid(columnSums.common) ? 'sum-valid' : 'sum-invalid'}>
                  <strong>{columnSums.common.toFixed(2)}</strong>
                  {!isColumnValid(columnSums.common) && (
                    <span className="sum-warning"> ⚠️</span>
                  )}
                </td>
                <td className={isColumnValid(columnSums.elevator) ? 'sum-valid' : 'sum-invalid'}>
                  <strong>{columnSums.elevator.toFixed(2)}</strong>
                  {!isColumnValid(columnSums.elevator) && (
                    <span className="sum-warning"> ⚠️</span>
                  )}
                </td>
                <td className={isColumnValid(columnSums.heating) ? 'sum-valid' : 'sum-invalid'}>
                  <strong>{columnSums.heating.toFixed(2)}</strong>
                  {!isColumnValid(columnSums.heating) && (
                    <span className="sum-warning"> ⚠️</span>
                  )}
                </td>
                <td className={isColumnValid(columnSums.equal) ? 'sum-valid' : 'sum-invalid'}>
                  <strong>{columnSums.equal.toFixed(2)}</strong>
                  {!isColumnValid(columnSums.equal) && (
                    <span className="sum-warning"> ⚠️</span>
                  )}
                </td>
                <td></td>
              </tr>
              <tr className="column-target-row">
                <td colSpan="2"><strong>Στόχος:</strong></td>
                <td><strong>1000.00</strong></td>
                <td><strong>1000.00</strong></td>
                <td><strong>1000.00</strong></td>
                <td><strong>1000.00</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="no-data">
            <p>Δεν βρέθηκαν διαμερίσματα.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
