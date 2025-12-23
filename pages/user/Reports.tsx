
import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PageHeader } from '../../components/ui/PageHeader';
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart, Wallet, 
  Package, ShoppingCart, ArrowUpRight, Activity, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Reports: React.FC = () => {
  const { user } = useAuth();

  const financialData = useMemo(() => {
    if (!user) return null;
    const transactions = db.transactions.getAllTenant(user.id);
    const articles = db.articles.getByTenant(user.id);

    // Sales & Costing
    const sales = transactions.filter(t => t.type === 'SALE');
    const totalRevenue = sales.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate Cost of Goods Sold (approximate based on current costing)
    let cogs = 0;
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const art = articles.find(a => a.id === item.articleId);
        if (art) {
          const unitCost = art.basePrice + (art.workCost || 0);
          cogs += item.quantity * unitCost;
        }
      });
    });

    const grossProfit = totalRevenue - cogs;
    
    // Expenses
    const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = grossProfit - expenses;

    // Stock Valuation
    const stockValuation = articles.reduce((sum, art) => {
      return sum + (art.stock * (art.basePrice + (art.workCost || 0)));
    }, 0);

    // Activity
    const purchaseValue = transactions.filter(t => t.type === 'PURCHASE').reduce((sum, t) => sum + t.amount, 0);
    const workValue = transactions.filter(t => t.type === 'WORK').reduce((sum, t) => sum + t.amount, 0);

    return { totalRevenue, cogs, grossProfit, expenses, netProfit, stockValuation, purchaseValue, workValue };
  }, [user]);

  if (!financialData) return null;

  const stats = [
    { label: 'Net Revenue', value: financialData.totalRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Gross Profit', value: financialData.grossProfit, icon: PieChart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Net Profit', value: financialData.netProfit, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Stock Value', value: financialData.stockValuation, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 h-full overflow-y-auto pb-10 custom-scrollbar">
      <PageHeader 
        title="Financial Intelligence" 
        subtitle="Comprehensive reporting on revenue, profit, and asset valuation."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all"
          >
            <div className={`w-16 h-16 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <s.icon className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">${s.value.toLocaleString()}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profitability Analysis */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Operational Breakdown</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5">Summary of Cash Flow</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Revenue Generated', val: financialData.totalRevenue, color: 'bg-emerald-500' },
              { label: 'Cost of Goods (COGS)', val: -financialData.cogs, color: 'bg-slate-400' },
              { label: 'Business Expenses', val: -financialData.expenses, color: 'bg-rose-400' },
              { label: 'Stock Procurement', val: -financialData.purchaseValue, color: 'bg-indigo-400' },
              { label: 'Processing Work Paid', val: -financialData.workValue, color: 'bg-amber-400' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm font-bold text-slate-600">{item.label}</span>
                </div>
                <span className={`font-black ${item.val < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {item.val < 0 ? '-' : '+'}${Math.abs(item.val).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Estimated Net Profit</p>
               <h4 className="text-3xl font-black tracking-tight">${financialData.netProfit.toLocaleString()}</h4>
             </div>
             <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6" />
             </div>
          </div>
        </section>

        {/* Stock Intelligence */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Asset Health</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5">Inventory Evaluation</p>
            </div>
          </div>

          <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex flex-col items-center text-center">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Total Capital in Stock</p>
            <h4 className="text-5xl font-black text-amber-900 tracking-tighter">${financialData.stockValuation.toLocaleString()}</h4>
            <p className="text-xs text-amber-700/60 font-medium mt-4 max-w-xs leading-relaxed">
              This represents the estimated liquid value of all fabric currently held across all active branches.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items in Catalog</div>
                <div className="text-2xl font-black text-slate-800">{db.articles.getByTenant(user.id).length}</div>
             </div>
             <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wholesale Partners</div>
                <div className="text-2xl font-black text-slate-800">{db.suppliers.getByTenant(user.id).length}</div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
