
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Search, Plus, Truck, User, DollarSign, X, Package, Ruler, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Article, Supplier } from '../../types';

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    supplierId: '', 
    articleId: '', 
    quantity: '', 
    price: '', 
    paid: '', 
    note: '' 
  });

  useEffect(() => {
    if (user && selectedBranch) {
      setPurchases(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'PURCHASE'));
      setArticles(db.articles.getByTenant(user.id));
      setSuppliers(db.suppliers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch) return;

    const selectedArt = articles.find(a => a.id === formData.articleId);
    const selectedSup = suppliers.find(s => s.id === formData.supplierId);
    
    if (!selectedArt || !selectedSup) {
      return toast.error("Please select a supplier and an article.");
    }

    const qty = parseFloat(formData.quantity);
    const prc = parseFloat(formData.price);
    const totalAmount = qty * prc;
    const paid = parseFloat(formData.paid) || 0;

    const purchase = {
      id: 'p_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'PURCHASE' as const,
      entityId: selectedSup.id,
      entityName: selectedSup.name,
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

    db.transactions.save(purchase as any);
    setPurchases([purchase, ...purchases]);
    setIsModalOpen(false);
    setFormData({ supplierId: '', articleId: '', quantity: '', price: '', paid: '', note: '' });
    toast.success('Purchase logged! Stock increased.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Stock Purchases</h2>
          <p className="text-slate-500 text-sm">Purchase fabrics from suppliers to replenish your inventory.</p>
        </div>
        <PermissionButton onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-14 px-8 rounded-2xl shadow-xl shadow-amber-100 border-b-4 border-amber-700 bg-amber-500 hover:bg-amber-600">
          <Plus className="w-5 h-5" /> Log Purchase
        </PermissionButton>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b">
                <th className="px-8 py-5">Supplier</th>
                <th className="px-8 py-5">Article (Fabric)</th>
                <th className="px-8 py-5">Qty</th>
                <th className="px-8 py-5">Total Cost</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchases.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-400 italic">No purchase records found.</td></tr>
              ) : purchases.map((p) => {
                const item = p.items?.[0];
                const balance = p.amount - p.paidAmount;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-700">{p.entityName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-600">{item?.articleName || 'N/A'}</td>
                    <td className="px-8 py-5 font-black text-indigo-600">{item?.quantity} <span className="text-[10px] font-bold text-slate-400 uppercase">{item?.unit}</span></td>
                    <td className="px-8 py-5 font-black text-slate-900">${p.amount}</td>
                    <td className="px-8 py-5 text-slate-500 text-xs">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${balance <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {balance <= 0 ? 'Cleared' : `Unpaid $${balance}`}
                      </span>
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
              <div className="p-8 border-b flex justify-between items-center bg-amber-50/30">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-amber-600" />
                  <h3 className="text-xl font-black text-slate-800">New Purchase</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400"/></button>
              </div>
              <form onSubmit={handleCreatePurchase} className="p-8 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Supplier</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 appearance-none">
                        <option value="">Choose Supplier...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Fabric (Article)</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <select required value={formData.articleId} onChange={e => setFormData({...formData, articleId: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 appearance-none">
                        <option value="">Choose Fabric...</option>
                        {articles.map(a => <option key={a.id} value={a.id}>{a.name} ({a.unit})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cash Paid</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input required value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all">Log Purchase</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Purchases;
