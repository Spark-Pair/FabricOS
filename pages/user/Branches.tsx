
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { db } from '../../lib/db';
import { Modal } from '../../components/Modal';
import { Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Branches: React.FC = () => {
  const { user } = useAuth();
  const { branches, refreshTenantData } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '' });

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newBranch = {
      id: 'b_' + Date.now(),
      tenantId: user.id,
      name: formData.name,
      address: formData.address,
      isDefault: branches.length === 0
    };

    db.branches.save(newBranch);
    refreshTenantData();
    setIsModalOpen(false);
    setFormData({ name: '', address: '' });
    toast.success('Branch added!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Branches</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold">
          <Plus className="w-5 h-5" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden">
            {b.isDefault && (
              <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">Default</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800">{b.name}</h4>
            </div>
            <p className="text-sm text-slate-500 mb-6">{b.address || 'No address provided'}</p>
            <button className="text-xs text-indigo-600 font-bold uppercase hover:underline">Edit Branch Details</button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Branch"
        subtitle="Outlet Management"
        icon={<MapPin className="w-5 h-5" />}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleCreateBranch} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Branch Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="e.g. Model Town Branch" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
            <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" rows={3} />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold mt-4">Create Branch</button>
        </form>
      </Modal>
    </div>
  );
};

export default Branches;
