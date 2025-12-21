
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Menu, X, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { subscriptionStatus, daysRemaining } = useTenant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Loading FabricFlow...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Terminal</span>
               <span className="text-sm font-bold text-slate-700">POS Window #{user.id.slice(-4)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
              {user.ownerName.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {subscriptionStatus === 'EXPIRED' && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm font-black text-xl">!</div>
                <div>
                  <h4 className="font-black text-rose-900">Subscription Expired</h4>
                  <p className="text-rose-700/70 text-sm font-medium">Application is currently in Read-Only Mode.</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">Renew Premium</button>
            </motion.div>
          )}
          
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
