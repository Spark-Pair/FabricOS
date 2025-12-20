
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit3, MoreVertical, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../lib/db';
import { UserProfile, UserRole } from '../../types';

const Users: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    username: '',
    password: '',
    phoneNumber: '',
  });

  useEffect(() => {
    setUsers(db.users.getAll().filter(u => u.role !== UserRole.ADMIN));
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (db.users.findByUsername(formData.username)) {
      return toast.error('Username already exists');
    }

    const userId = 'u_' + Date.now();
    const newUser: UserProfile = {
      ...formData,
      id: userId,
      role: UserRole.USER,
      isActive: true,
      registrationDate: new Date().toISOString(),
      currentSubscription: {
        id: 'sub_' + Date.now(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 0,
        isPaid: true,
        type: 'DEMO'
      }
    };

    db.users.save(newUser);
    db.branches.save({
      id: 'b_' + Date.now(),
      tenantId: userId,
      name: 'Main Branch',
      isDefault: true
    });

    setUsers(db.users.getAll().filter(u => u.role !== UserRole.ADMIN));
    setIsModalOpen(false);
    toast.success('Shop created with 30-day Demo!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shops & Tenants</h2>
          <p className="text-sm text-slate-500">Manage business accounts and billing</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all"
        >
          <Plus className="w-5 h-4" /> Add New Shop
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
           <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shops..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Shop Name</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Owner / Phone</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Username</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Subscription</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No shops registered yet.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{user.shopName}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Registered: {new Date(user.registrationDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-700 font-medium">{user.ownerName}</div>
                  <div className="text-xs text-slate-500">{user.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 text-indigo-600 font-mono text-xs">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.currentSubscription?.type === 'DEMO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {user.currentSubscription?.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-indigo-600"><CreditCard className="w-4 h-4"/></button>
                    <button className="p-2 text-slate-400 hover:text-blue-600"><Edit3 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-xl font-bold text-slate-800">Shop Registration</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Shop Name</label>
                <input required value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Silk Haven" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Owner Name</label>
                <input required value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="login_id" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                <input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} type="tel" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="03xx-xxxxxxx" />
              </div>
              
              <div className="col-span-2 flex justify-end gap-3 pt-6 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">Create Tenant</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Users;
