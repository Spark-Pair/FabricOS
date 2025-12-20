
import React, { useMemo } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, CreditCard, Wallet, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();

  const metrics = useMemo(() => {
    if (!user || !selectedBranch) return null;
    const trans = db.transactions.getByBranch(user.id, selectedBranch.id);
    
    const sales = trans.filter(t => t.type === 'SALE');
    const totalSales = sales.reduce((sum, t) => sum + t.amount, 0);
    const totalCollected = sales.reduce((sum, t) => sum + t.paidAmount, 0);
    const receivables = totalSales - totalCollected;

    const purchases = trans.filter(t => t.type === 'PURCHASE');
    const totalPurchases = purchases.reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = purchases.reduce((sum, t) => sum + t.paidAmount, 0);
    const payables = totalPurchases - totalPaid;

    const expenses = trans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

    return { totalSales, receivables, payables, expenses };
  }, [user, selectedBranch]);

  const cards = [
    { title: 'Total Sales', value: `$${metrics?.totalSales || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Accounts Receivable', value: `$${metrics?.receivables || 0}`, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Accounts Payable', value: `$${metrics?.payables || 0}`, icon: CreditCard, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Total Expenses', value: `$${metrics?.expenses || 0}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Good Morning, {user?.ownerName}</h2>
          <p className="text-slate-500 mt-1">Here's what's happening at <strong>{selectedBranch?.name}</strong> today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm text-sm font-medium text-slate-600">
          <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
             <p className="text-slate-400 text-sm text-center py-12 italic">No recent transactions in this branch.</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Grow your business</h3>
            <p className="text-indigo-100 text-sm mb-6 max-w-[240px]">Access advanced analytics and multi-branch synchronization with Premium.</p>
            <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors">Upgrade Now</button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
