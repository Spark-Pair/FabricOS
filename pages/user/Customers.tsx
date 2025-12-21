
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
// Fix: Added Users to the imported icons from lucide-react
import { Search, Plus, User, Users, Phone, DollarSign, X, MoreHorizontal, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (user) setCustomers(db.customers.getByTenant(user.id));
  }, [user]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newCust = {
      id: 'c_' + Date.now(),
      tenantId: user.id,
      name: formData.name,
      phone: formData.phone,
      balance: 0
    };

    db.customers.save(newCust);
    setCustomers([...customers, newCust]);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '' });
    toast.success('Customer added successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Customer Network</h2>
          <p className="text-slate-500 mt-1 font-medium">Relationships and receivables management.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white h-14 px-8 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> Add Customer
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
               <Users className="w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold italic">No customers registered yet.</p>
          </div>
        ) : customers.map((c, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            key={c.id} 
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {c.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <h4 className="text-xl font-black text-slate-800">{c.name}</h4>
            <p className="text-sm text-slate-400 font-bold mt-1 inline-flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-400" /> {c.phone}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Outstanding Balance</span>
                <span className={`text-xl font-black ${c.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${c.balance.toLocaleString()}
                </span>
              </div>
              <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors">
                Statement
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
                <h3 className="text-2xl font-black text-slate-800">Add Customer</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleCreateCustomer} className="p-10 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. John Doe" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="03xx-xxxxxxx" />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black mt-6 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                  Save Customer
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
