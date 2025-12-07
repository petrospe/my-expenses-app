import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <Link to="/" className={`nav-link ${isActive('/')}`}>
        Αρχική
      </Link>
      <Link to="/expenses" className={`nav-link ${isActive('/expenses')}`}>
        Δαπάνες
      </Link>
      <Link to="/tenants" className={`nav-link ${isActive('/tenants')}`}>
        Διαμερίσματα
      </Link>
      <Link to="/calculate" className={`nav-link ${isActive('/calculate')}`}>
        Υπολογισμός
      </Link>
      <Link to="/archive" className={`nav-link ${isActive('/archive')}`}>
        Αρχείο
      </Link>
      <Link to="/settings" className={`nav-link ${isActive('/settings')}`}>
        Ρυθμίσεις
      </Link>
      <Link to="/view-storage" className={`nav-link ${isActive('/view-storage')}`}>
        LocalStorage
      </Link>
    </nav>
  );
}

export default Navigation;

