
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { subscriptionStatus, daysRemaining } = useTenant();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen p-8">
        {subscriptionStatus === 'EXPIRED' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="text-red-800 text-sm font-medium">
              Your subscription has expired. The application is now in <strong>Read-Only Mode</strong>.
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-bold">Renew Now</button>
          </div>
        )}
        {subscriptionStatus === 'TRIAL' && daysRemaining <= 5 && daysRemaining > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">
            Trial ends in {daysRemaining} days. Upgrade to Premium to avoid service interruption.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
