
import React, { useMemo } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, CreditCard, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Package, Receipt, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    const recent = trans.slice(0, 5);

    return { totalSales, receivables, payables, expenses, recent };
  }, [user, selectedBranch]);

  const cards = [
    { title: 'Total Sales', value: `$${metrics?.totalSales.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%', trendUp: true },
    { title: 'Receivables', value: `$${metrics?.receivables.toLocaleString() || 0}`, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Balance', trendUp: null },
    { title: 'Payables', value: `$${metrics?.payables.toLocaleString() || 0}`, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Due', trendUp: null },
    { title: 'Expenses', value: `$${metrics?.expenses.toLocaleString() || 0}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2.1%', trendUp: false },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 h-full overflow-y-auto pb-10 custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">Hello, {user?.ownerName.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 mt-2 font-medium">Business performance at <span className="text-indigo-600 font-bold">{selectedBranch?.name}</span> outlet.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
            <Calendar className="w-4 h-4 text-indigo-500" /> 
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                <card.icon className="w-7 h-7" />
              </div>
              {card.trendUp !== null && (
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </div>
              )}
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
            <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800">Recent Activity</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Latest ledger entries for this branch.</p>
            </div>
            <Link to="/sales" className="text-indigo-600 text-sm font-black hover:underline inline-flex items-center gap-2 group">
              Full Ledger <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {metrics?.recent && metrics.recent.length > 0 ? (
              metrics.recent.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between p-5 hover:bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
                      t.type === 'SALE' ? 'bg-emerald-50 text-emerald-600' :
                      t.type === 'PURCHASE' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type === 'SALE' ? <Receipt className="w-5 h-5"/> : t.type === 'PURCHASE' ? <Truck className="w-5 h-5"/> : <Wallet className="w-5 h-5"/>}
                    </div>
                    <div>
                      <div className="font-black text-slate-800">{t.entityName}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                        {t.type} • {new Date(t.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-black tracking-tight ${t.type === 'SALE' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.type === 'SALE' ? '+' : '-'}${t.amount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      {t.amount === t.paidAmount ? 'Cleared' : `Due: $${t.amount - t.paidAmount}`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                    <Package className="w-12 h-12 opacity-50" />
                </div>
                <div className="max-w-xs mx-auto">
                  <p className="text-slate-500 font-bold text-lg leading-snug">No transactions yet.</p>
                  <p className="text-slate-400 text-sm mt-2">Start your day by recording your first sale or purchase.</p>
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <Link to="/sales" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">New Sale</Link>
                    <Link to="/purchases" className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">New Purchase</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-indigo-200 min-h-[400px]">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                <ArrowUpRight className="w-8 h-8 text-indigo-100" />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">Expand Your Reach</h3>
              <p className="text-indigo-100/80 text-base leading-relaxed mb-10 font-medium">
                Unlock multi-branch analytics, staff role permissions, and GST-ready invoices.
              </p>
              <button className="w-full bg-white text-indigo-700 py-5 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-2xl active:scale-95">
                Upgrade Workspace
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]"></div>
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
              <TrendingUp className="w-48 h-48" />
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="text-xs font-bold text-slate-600">Active Articles</div>
                   <div className="text-sm font-black text-slate-900">{db.articles.getByTenant(user?.id || '').length}</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="text-xs font-bold text-slate-600">Total Branches</div>
                   <div className="text-sm font-black text-slate-900">{db.branches.getByTenant(user?.id || '').length}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
