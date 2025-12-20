
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
        <PermissionButton onClick={() => setIsModalOpen(true)} variant="danger" className="flex items-center gap-2 h-12">
          <Plus className="w-5 h-5" /> Add Expense
        </PermissionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white border-2 border-dashed rounded-3xl">
            No expenses recorded yet.
          </div>
        ) : expenses.map(ex => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={ex.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-1 rounded-md mb-2 inline-block">
                {ex.category}
              </span>
              <h4 className="font-bold text-slate-800">{ex.entityName}</h4>
              <p className="text-xs text-slate-400 mt-1">{new Date(ex.date).toLocaleDateString()}</p>
            </div>
            <div className="text-xl font-black text-slate-900">${ex.amount}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-rose-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">New Expense</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400"/></button>
              </div>
              <form onSubmit={handleCreateExpense} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="What was this for?" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-300" />
                    <input required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} type="number" className="w-full pl-11 p-3 bg-slate-50 border rounded-xl outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100">Record Expense</button>
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
