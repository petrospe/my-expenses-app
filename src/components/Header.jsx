import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation.jsx';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Διαχείριση Κοινοχρήστων</h1>
        <Navigation />
      </div>
    </header>
  );
}

export default Header;

