
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Combobox } from '../../components/Combobox';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Plus, Truck, Package, Ruler, Hash, Trash2, PlusCircle, FileText, ChevronRight, PenTool, DollarSign, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Article, Supplier, Transaction } from '../../types';

const WorkProcessing: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [workEntries, setWorkEntries] = useState<Transaction[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    articleId: '',
    description: '',
    quantity: '',
    pricePerUnit: '',
    paidAmount: '0'
  });

  useEffect(() => {
    if (user && selectedBranch) {
      setWorkEntries(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'WORK'));
      setArticles(db.articles.getByTenant(user.id));
      setSuppliers(db.suppliers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const handleCreateWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !formData.supplierId || !formData.articleId) {
      return toast.error("Please fill all required fields.");
    }

    const selectedArt = articles.find(a => a.id === formData.articleId);
    const selectedSup = suppliers.find(s => s.id === formData.supplierId);
    if (!selectedArt || !selectedSup) return;

    const qty = parseFloat(formData.quantity);
    const prc = parseFloat(formData.pricePerUnit);
    const paid = parseFloat(formData.paidAmount);

    if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc < 0) {
      return toast.error("Invalid numeric values.");
    }

    const totalAmount = qty * prc;

    const workTransaction: Transaction = {
      id: 'w_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'WORK',
      entityId: selectedSup.id,
      entityName: selectedSup.name,
      amount: totalAmount,
      paidAmount: paid,
      date: new Date().toISOString(),
      workDescription: formData.description,
      workPricePerUnit: prc,
      items: [{
        articleId: selectedArt.id,
        articleName: selectedArt.name,
        quantity: qty,
        unit: selectedArt.unit,
        price: prc
      }]
    };

    db.transactions.save(workTransaction);
    setWorkEntries([workTransaction, ...workEntries]);
    setIsModalOpen(false);
    setFormData({
      supplierId: '',
      articleId: '',
      description: '',
      quantity: '',
      pricePerUnit: '',
      paidAmount: '0'
    });
    toast.success('Work processing record saved! Article costing updated.');
  };

  const supplierOptions = suppliers.map(s => ({ id: s.id, label: s.name, sublabel: s.phone }));
  const articleOptions = articles.map(a => ({ id: a.id, label: a.name, sublabel: `Unit: ${a.unit} | Stock: ${a.stock}` }));

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 relative overflow-hidden h-full pb-6">
      <PageHeader 
        title="Processing Work" 
        subtitle="Manage value-addition services like embroidery, printing, and dyeing."
        actions={
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Record Work
          </button>
        }
      />

      <div className="bg-white rounded-[3rem] border border-slate-100 h-full shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Vendor & Service</th>
                <th className="px-10 py-6">Fabric Stock</th>
                <th className="px-10 py-6">Cost Breakdown</th>
                <th className="px-10 py-6">Total Value</th>
                <th className="px-10 py-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {workEntries.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-base">{w.entityName}</div>
                        <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">
                          {w.workDescription || 'Value Added Service'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-bold text-slate-800">{w.items?.[0]?.articleName}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      {w.items?.[0]?.quantity} {w.items?.[0]?.unit}s processed
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-sm font-black text-slate-900">${w.workPricePerUnit?.toLocaleString()} / unit</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Processing Rate</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xl font-black text-slate-900 tracking-tight">${w.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                      {w.amount - w.paidAmount > 0 ? `Unpaid: $${w.amount - w.paidAmount}` : 'Settled'}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      {new Date(w.date).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workEntries.length === 0 && <EmptyState icon={<Activity className="w-16 h-16" />} message="No work processing entries yet" />}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Processing Work" icon={<PenTool className="w-6 h-6" />} maxWidth="max-w-2xl" footer={
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px]">Discard</button>
          <PermissionButton onClick={handleCreateWork} className="flex-1 py-4 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Save Work Entry</PermissionButton>
        </div>
      }>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Combobox label="Supplier (Work Done By)" placeholder="Select vendor..." options={supplierOptions} value={formData.supplierId} onChange={id => setFormData({...formData, supplierId: id})} icon={<Truck className="w-4 h-4" />} />
            <Combobox label="Article (Stock Processed)" placeholder="Select fabric..." options={articleOptions} value={formData.articleId} onChange={id => setFormData({...formData, articleId: id})} icon={<Package className="w-4 h-4" />} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Description</label>
            <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} type="text" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. Embroidery, Printing, Dyeing..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity Processed</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Qty" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Price (Per Unit)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={formData.pricePerUnit} onChange={e => setFormData({...formData, pricePerUnit: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Rate" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cash Paid (Optional)</label>
            <input value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} type="number" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Amount paid now..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkProcessing;
