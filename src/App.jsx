import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Expenses from './pages/Expenses.jsx';
import Tenants from './pages/Tenants.jsx';
import Calculate from './pages/Calculate.jsx';
import Archive from './pages/Archive.jsx';
import AddExpense from './pages/AddExpense.jsx';
import ViewLocalStorage from './pages/ViewLocalStorage.jsx';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/calculate" element={<Calculate />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/view-storage" element={<ViewLocalStorage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

