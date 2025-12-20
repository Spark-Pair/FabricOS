
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Users from './pages/admin/Users';
import Sales from './pages/user/Sales';
import Purchases from './pages/user/Purchases';
import Expenses from './pages/user/Expenses';
import Customers from './pages/user/Customers';
import Suppliers from './pages/user/Suppliers';
import Branches from './pages/user/Branches';
import Articles from './pages/user/Articles';
import Dashboard from './pages/user/Dashboard';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
      <span className="text-4xl text-slate-200">🛠️</span>
    </div>
    <h3 className="text-2xl font-black text-slate-400">{title} Module</h3>
    <p className="text-slate-300 max-w-sm mx-auto mt-2">Content for this module is currently in active development for the next update.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<MainLayout />}>
            {/* Admin Routes */}
            <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
            <Route path="/admin/users" element={<Users />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payables" element={<PlaceholderPage title="Payables" />} />
            <Route path="/receivables" element={<PlaceholderPage title="Receivables" />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
            <Route path="/branches" element={<Branches />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>
          
          <Route path="*" element={<div className="h-screen flex items-center justify-center font-bold">404 - Not Found</div>} />
        </Routes>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
