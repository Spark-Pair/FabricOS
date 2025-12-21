
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { Modal } from '../../components/Modal';
import { Plus, Store, Truck, Phone, MoreHorizontal, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Suppliers: React.FC = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (user) setSuppliers(db.suppliers.getByTenant(user.id));
  }, [user]);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newSup = {
      id: 'sup_' + Date.now(),
      tenantId: user.id,
      name: formData.name,
      phone: formData.phone,
      balance: 0
    };

    db.suppliers.save(newSup);
    setSuppliers([...suppliers, newSup]);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '' });
    toast.success('Supplier added to your network!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Supplier Network</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage textile providers and procurement balances.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 text-white h-14 px-8 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Supplier
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Truck className="w-10 h-10" />
             </div>
             <p className="text-slate-400 font-bold italic text-lg">No suppliers found.</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-4 text-indigo-600 font-black hover:underline inline-flex items-center gap-2">
               Register your first supplier <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        ) : suppliers.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
            key={s.id} 
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {s.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <h4 className="text-xl font-black text-slate-800 truncate">{s.name}</h4>
            <p className="text-sm text-slate-400 font-bold mt-1 inline-flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-400" /> {s.phone}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Payable Balance</span>
                <span className={`text-xl font-black ${s.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${s.balance.toLocaleString()}
                </span>
              </div>
              <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors uppercase tracking-widest">
                Ledger
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Supplier"
        subtitle="Vendor Management"
        icon={<Store className="w-6 h-6" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSupplier} className="p-10 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                type="text" 
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" 
                placeholder="e.g. Al-Noor Textiles" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                type="tel" 
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" 
                placeholder="03xx-xxxxxxx" 
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-sm">
              Register Supplier
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full mt-4 py-2 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]">
              Dismiss
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
