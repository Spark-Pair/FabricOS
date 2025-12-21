
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Combobox } from '../../components/Combobox';
import { Plus, Truck, User, DollarSign, X, Package, Ruler, Filter, ChevronRight, CheckCircle2, Clock, Hash, Menu, Ellipsis, EllipsisVertical } from 'lucide-react';
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

  const supplierOptions = suppliers.map(s => ({
    id: s.id,
    label: s.name,
    sublabel: s.phone
  }));

  const articleOptions = articles.map(a => ({
    id: a.id,
    label: a.name,
    sublabel: `Current stock: ${a.stock} ${a.unit}s`
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-10 relative pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Procurement</h2>
          <p className="text-slate-500 mt-2 font-medium italic">Restocking inventory for <span className="text-indigo-600 font-bold">{selectedBranch?.name}</span> outlet.</p>
        </div>
        <div className="flex gap-3.5 items-center">
          <button onClick={() => setIsModalOpen(true)} className="grow flex items-center gap-3.5 px-5 py-3.5 bg-indigo-600 border border-indigo-600 text-white font-medium text-sm tracking-wider rounded-2xl hover:bg-indigo-600 transition-all duration-300">
            <Plus size={18} /> Add Record
          </button>
          <button className="grow flex items-center gap-3.5 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 font-medium text-sm tracking-wider rounded-2xl hover:bg-slate-100 transition-all duration-300">
            <Filter size={16} /> Advanced Filters
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/70 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-200">
                <th className="px-6 py-6">Supplier Details</th>
                <th className="px-6 py-6">Fabric Items</th>
                <th className="px-6 py-6">Purchase Cost</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <Truck className="w-10 h-10" />
                      </div>
                      <p className="text-slate-400 font-black italic text-lg">No procurement records found.</p>
                      <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-black hover:underline text-sm uppercase tracking-widest">Restock your inventory</button>
                    </div>
                  </td>
                </tr>
              ) : purchases.map((p) => {
                const item = p.items?.[0];
                const balance = p.amount - p.paidAmount;
                const isPaid = balance <= 0;
                return (
                  <>
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                          {p.entityName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-base">{p.entityName}</div>
                          <div className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                            <Hash className="w-3 h-3" /> PO-{p.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700">{item?.articleName}</div>
                      <div className="text-xs text-indigo-500 font-black mt-1 uppercase tracking-wider">
                        {item?.quantity} {item?.unit}s @ ${item?.price}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xl font-black text-slate-900 tracking-tight">${p.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {isPaid ? 'Cleared' : `Unpaid: $${balance}`}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 px-4">
                        <EllipsisVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">New Purchase</h3>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">Stock Procurement</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-600"/>
                </button>
              </div>
              <form onSubmit={handleCreatePurchase} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                  <Combobox 
                    label="Supplier"
                    placeholder="Search supplier name..."
                    options={supplierOptions}
                    value={formData.supplierId}
                    onChange={(id) => setFormData({...formData, supplierId: id})}
                    icon={<User className="w-4 h-4" />}
                  />

                  <Combobox 
                    label="Fabric (Article)"
                    placeholder="Search fabric items..."
                    options={articleOptions}
                    value={formData.articleId}
                    onChange={(id) => setFormData({...formData, articleId: id})}
                    icon={<Package className="w-4 h-4" />}
                  />

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} type="number" step="0.01" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" placeholder="0.00" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cash Paid</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input required value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                  <PermissionButton type="submit" className="flex-1 py-5 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Confirm Entry</PermissionButton>
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
