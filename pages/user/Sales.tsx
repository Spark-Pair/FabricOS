
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Combobox } from '../../components/Combobox';
import { Search, Plus, Receipt, User, DollarSign, X, Package, Ruler, Hash, Filter, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
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
    setArticles(db.articles.getByTenant(user.id));
    setIsModalOpen(false);
    setFormData({ customerId: '', articleId: '', quantity: '', price: '', paid: '', note: '' });
    toast.success('Sale recorded successfully!');
  };

  const customerOptions = customers.map(c => ({
    id: c.id,
    label: c.name,
    sublabel: c.phone
  }));

  const articleOptions = articles.map(a => ({
    id: a.id,
    label: a.name,
    sublabel: `${a.stock} ${a.unit}s available`,
    disabled: a.stock <= 0
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Direct Sales</h2>
          <p className="text-slate-500 mt-2 font-medium italic">Generating revenue at <span className="text-indigo-600 font-bold">{selectedBranch?.name}</span> outlet.</p>
        </div>
        <PermissionButton onClick={() => setIsModalOpen(true)} className="h-16 px-10 rounded-[2rem] text-lg">
          <Plus className="w-6 h-6" /> Create Invoice
        </PermissionButton>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by customer or invoice #..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold"
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">
            <Filter className="w-4 h-4" /> Filter Options
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-6">Customer Info</th>
                <th className="px-10 py-6">Fabric Items</th>
                <th className="px-10 py-6">Invoice Total</th>
                <th className="px-10 py-6">Payment Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <Receipt className="w-10 h-10" />
                      </div>
                      <p className="text-slate-400 font-black italic text-lg">No sales found in this branch.</p>
                      <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-black hover:underline text-sm uppercase tracking-widest">Issue your first invoice</button>
                    </div>
                  </td>
                </tr>
              ) : sales.map((sale) => {
                const item = sale.items?.[0];
                const balance = sale.amount - sale.paidAmount;
                const isPaid = balance <= 0;
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                    <td className="px-10 py-8">
                       <div className="font-black text-slate-800 text-base">{sale.entityName}</div>
                       <div className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 mt-2 uppercase tracking-widest">
                         <Hash className="w-3 h-3" /> INV-{sale.id.slice(-6)}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-bold text-slate-700">{item?.articleName}</div>
                      <div className="text-xs text-indigo-500 font-black mt-1 uppercase tracking-wider">
                        {item?.quantity} {item?.unit}s @ ${item?.price}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-xl font-black text-slate-900 tracking-tight">${sale.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(sale.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {isPaid ? 'Fully Paid' : `Due: $${balance}`}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">New Sale</h3>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">Invoice Entry</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-600"/>
                </button>
              </div>
              <form onSubmit={handleCreateSale} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                  <Combobox 
                    label="Customer"
                    placeholder="Search customer name..."
                    options={customerOptions}
                    value={formData.customerId}
                    onChange={(id) => setFormData({...formData, customerId: id})}
                    icon={<User className="w-4 h-4" />}
                  />

                  <Combobox 
                    label="Fabric Article"
                    placeholder="Select fabric from catalog..."
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Received Cash</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input required value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" placeholder="0.00" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                  <PermissionButton type="submit" className="flex-1 py-5 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Confirm Invoice</PermissionButton>
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
