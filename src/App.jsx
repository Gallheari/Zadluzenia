import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddDebt from './pages/AddDebt';
import RepayDebt from './pages/RepayDebt';
import Navbar from './components/Navbar';
import UserSelector from './components/UserSelector';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />
        <UserSelector />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddDebt />} />
            <Route path="/repay" element={<RepayDebt />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
