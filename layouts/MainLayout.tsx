
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { subscriptionStatus } = useTenant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Loading FabricOS...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
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
              className="fixed inset-y-0 left-0 w-80 z-50 lg:hidden"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Menu Trigger (Only visible on mobile since header is removed) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>

        <main className="p-6 md:pb-5 h-screen overflow-hidden">
          {subscriptionStatus === 'EXPIRED' && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm font-black text-xl">!</div>
                <div>
                  <h4 className="font-black text-rose-900">Subscription Expired</h4>
                  <p className="text-rose-700/70 text-sm font-medium">Application is currently in Read-Only Mode.</p>
                </div>
              </div>
              <button className="px-8 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">Renew Premium</button>
            </motion.div>
          )}
          
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
