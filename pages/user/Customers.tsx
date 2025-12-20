
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { Search, Plus, User, Phone, DollarSign, X } from 'lucide-react';
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
    toast.success('Customer added!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Customers</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold">
          <Plus className="w-5 h-5" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                {c.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{c.name}</h4>
                <p className="text-xs text-slate-400">{c.phone}</p>
              </div>
            </div>
            <div className="pt-4 border-t flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Current Balance</span>
              <span className={`font-bold ${c.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${c.balance}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-indigo-50/30">
                <h3 className="text-xl font-black">Add Customer</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <form onSubmit={handleCreateCustomer} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-100">Save Customer</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
