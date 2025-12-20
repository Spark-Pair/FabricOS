
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Search, Plus, Eye, Receipt, User, DollarSign, X, Package, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Article, Customer } from '../../types';

const Sales: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [sales, setSales] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    customerId: '', 
    articleId: '', 
    quantity: '', 
    price: '', 
    paid: '', 
    note: '' 
  });

  useEffect(() => {
    if (user && selectedBranch) {
      setSales(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'SALE'));
      setArticles(db.articles.getByTenant(user.id));
      setCustomers(db.customers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch) return;

    const selectedArt = articles.find(a => a.id === formData.articleId);
    const selectedCust = customers.find(c => c.id === formData.customerId);
    
    if (!selectedArt || !selectedCust) {
      return toast.error("Please select a customer and an article.");
    }

    const qty = parseFloat(formData.quantity);
    if (selectedArt.stock < qty) {
      return toast.error(`Insufficient stock! You only have ${selectedArt.stock} ${selectedArt.unit}s left.`);
    }

    const prc = parseFloat(formData.price);
    const totalAmount = qty * prc;
    const paid = parseFloat(formData.paid) || 0;

    const sale = {
      id: 's_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'SALE' as const,
      entityId: selectedCust.id,
      entityName: selectedCust.name,
      amount: totalAmount,
      paidAmount: paid,
      date: new Date().toISOString(),
      note: formData.note,
      items: [{
        articleId: selectedArt.id,
        articleName: selectedArt.name,
        quantity: qty,
        unit: selectedArt.unit,
        price: prc
      }]
    };

    db.transactions.save(sale as any);
    setSales([sale, ...sales]);
    
    // Refresh local state lists
    setArticles(db.articles.getByTenant(user.id));
    
    setIsModalOpen(false);
    setFormData({ customerId: '', articleId: '', quantity: '', price: '', paid: '', note: '' });
    toast.success('Sale recorded! Stock updated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Direct Sales</h2>
          <p className="text-slate-500 text-sm">Create invoices and manage customer credit.</p>
        </div>
        <PermissionButton onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100 border-b-4 border-indigo-800">
          <Plus className="w-5 h-5" /> New Invoice
        </PermissionButton>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b">
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Fabric (Article)</th>
                <th className="px-8 py-5">Qty</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-400 italic">No sales found for this branch.</td></tr>
              ) : sales.map((sale) => {
                const item = sale.items?.[0];
                const balance = sale.amount - sale.paidAmount;
                const isPaid = balance <= 0;
                return (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="font-bold text-slate-700">{sale.entityName}</div>
                       <div className="text-[10px] text-slate-400 font-mono">{sale.id}</div>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-600">{item?.articleName || 'N/A'}</td>
                    <td className="px-8 py-5 font-black text-indigo-600">{item?.quantity} <span className="text-[10px] font-bold text-slate-400 uppercase">{item?.unit}</span></td>
                    <td className="px-8 py-5 font-black text-slate-900">${sale.amount}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPaid ? 'Paid' : `Credit $${balance}`}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">New Sale</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600"/></button>
              </div>
              <form onSubmit={handleCreateSale} className="p-8 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                        <option value="">Select Customer...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Fabric</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <select required value={formData.articleId} onChange={e => setFormData({...formData, articleId: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                        <option value="">Select Fabric...</option>
                        {articles.map(a => (
                          <option key={a.id} value={a.id} disabled={a.stock <= 0}>
                            {a.name} (Available: {a.stock} {a.unit}s)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} type="number" step="0.01" className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price per Unit</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Received Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input required value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6 border-t mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Generate Invoice</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
