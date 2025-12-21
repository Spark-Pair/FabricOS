
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Plus, Receipt, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Shop Rent' });

  useEffect(() => {
    if (user && selectedBranch) {
      setExpenses(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'EXPENSE'));
    }
  }, [user, selectedBranch]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch) return;

    const expense = {
      id: 'e_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'EXPENSE' as const,
      entityName: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      paidAmount: parseFloat(formData.amount),
      date: new Date().toISOString(),
    };

    db.transactions.save(expense);
    setExpenses([expense, ...expenses]);
    setIsModalOpen(false);
    setFormData({ description: '', amount: '', category: 'Shop Rent' });
    toast.success('Expense recorded!');
  };

  const categories = ['Shop Rent', 'Electricity Bill', 'Staff Salary', 'Stationery', 'Misc'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Expenses</h2>
          <p className="text-slate-500 text-sm">Track overheads for <strong>{selectedBranch?.name}</strong></p>
        </div>
        <PermissionButton onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2 h-14 px-8 rounded-2xl">
          <Plus className="w-5 h-5" /> Add Expense
        </PermissionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Receipt className="w-10 h-10" />
             </div>
             <p className="text-slate-400 font-bold italic text-lg">No expenses recorded yet.</p>
          </div>
        ) : expenses.map(ex => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={ex.id} className="bg-white p-8 rounded-[2rem] border shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2.5 py-1.5 rounded-lg mb-3 inline-block tracking-wider">
                {ex.category}
              </span>
              <h4 className="font-black text-slate-800 text-lg leading-tight">{ex.entityName}</h4>
              <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">{new Date(ex.date).toLocaleDateString()}</p>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">${ex.amount.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-10 border-b flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl shadow-sm flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">New Expense</h3>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.15em] mt-1">Cash Outflow</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-600"/>
                </button>
              </div>
              <form onSubmit={handleCreateExpense} className="p-10 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold appearance-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Memo / Description</label>
                  <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" placeholder="e.g. Monthly Electricity Bill" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Paid</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} type="number" className="w-full pl-11 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" placeholder="0.00" />
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]">Discard</button>
                  <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-xs">Record Expense</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
