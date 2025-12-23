
import React, { useState, useEffect, useMemo } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Combobox } from '../../components/Combobox';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Plus, Truck, Package, Ruler, Hash, Trash2, PlusCircle, FileText, ChevronRight, PenTool, DollarSign, Activity, Layers, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Article, Supplier, Transaction, StockBatch, StockStage } from '../../types';

const WorkProcessing: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [workEntries, setWorkEntries] = useState<Transaction[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    sourceBatchId: '',
    stage: 'PRINTED' as StockStage,
    description: '',
    quantity: '',
    pricePerUnit: '',
    paidAmount: '0'
  });

  useEffect(() => {
    if (user && selectedBranch) {
      setWorkEntries(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'WORK'));
      setBatches(db.batches.getByTenant(user.id).filter(b => b.currentQuantity > 0));
      setSuppliers(db.suppliers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const selectedSourceBatch = useMemo(() => 
    batches.find(b => b.id === formData.sourceBatchId), 
  [formData.sourceBatchId, batches]);

  const handleCreateWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !formData.supplierId || !formData.sourceBatchId || !selectedSourceBatch) {
      return toast.error("Please fill all required fields.");
    }

    const qty = parseFloat(formData.quantity);
    const prc = parseFloat(formData.pricePerUnit);
    const paid = parseFloat(formData.paidAmount);

    if (qty > selectedSourceBatch.currentQuantity) {
      return toast.error(`Insufficient stock in selected batch! Max: ${selectedSourceBatch.currentQuantity}`);
    }

    const totalAmount = qty * prc;

    // Added createdAt property to satisfy the Transaction interface requirements
    const workTransaction: Transaction = {
      id: 'w_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'WORK',
      category: formData.stage,
      entityId: formData.supplierId,
      entityName: suppliers.find(s => s.id === formData.supplierId)?.name || '',
      amount: totalAmount,
      paidAmount: paid,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      workDescription: formData.description,
      workPricePerUnit: prc,
      sourceBatchId: formData.sourceBatchId,
      items: [{
        articleId: selectedSourceBatch.articleId,
        articleName: selectedSourceBatch.articleName,
        batchId: '', // To be filled by target batch logic in db.ts
        quantity: qty,
        unit: selectedSourceBatch.unit,
        price: prc,
        unitCost: selectedSourceBatch.unitCost + prc
      }]
    };

    db.transactions.save(workTransaction);
    
    // Refresh
    setWorkEntries([workTransaction, ...workEntries]);
    setBatches(db.batches.getByTenant(user.id).filter(b => b.currentQuantity > 0));
    setIsModalOpen(false);
    setFormData({ supplierId: '', sourceBatchId: '', stage: 'PRINTED', description: '', quantity: '', pricePerUnit: '', paidAmount: '0' });
    toast.success('Stock Transformation Complete! New batch created.');
  };

  const supplierOptions = suppliers.map(s => ({ id: s.id, label: s.name, sublabel: s.phone }));
  const batchOptions = batches.map(b => ({ 
    id: b.id, 
    label: `${b.articleName} (${b.stage})`, 
    sublabel: `Cost: $${b.unitCost} | Avail: ${b.currentQuantity} ${b.unit}s` 
  }));

  const stageOptions = [
    { id: 'PRINTED', label: 'Printing' },
    { id: 'DYED', label: 'Dyeing' },
    { id: 'EMBROIDERED', label: 'Embroidery' },
    { id: 'FINISHED', label: 'Finishing' },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 relative overflow-hidden h-full pb-20 custom-scrollbar">
      <PageHeader 
        title="Stock Transformation" 
        subtitle="Manage the conversion of RAW fabric into PROCESSED stock stages."
        actions={
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Start New Work
          </button>
        }
      />

      <div className="bg-white rounded-[3rem] border border-slate-100 h-full shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Vendor & Service</th>
                <th className="px-10 py-6">Transformation</th>
                <th className="px-10 py-6">Value Addition</th>
                <th className="px-10 py-6">Processing Cost</th>
                <th className="px-10 py-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {workEntries.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80 transition-all">
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
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold text-slate-500">{w.items?.[0]?.articleName}</div>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg uppercase tracking-widest">{w.category}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      {w.items?.[0]?.quantity} {w.items?.[0]?.unit}s processed
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-black text-slate-900">${w.workPricePerUnit?.toLocaleString()} / unit</td>
                  <td className="px-10 py-8 text-xl font-black text-slate-900 tracking-tight">${w.amount.toLocaleString()}</td>
                  <td className="px-10 py-8 text-right text-xs font-black text-slate-500 uppercase">{new Date(w.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {workEntries.length === 0 && <EmptyState icon={<Activity className="w-16 h-16" />} message="No stock transformation records yet" />}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Stock Transformation" icon={<PenTool className="w-6 h-6" />} maxWidth="max-w-2xl" footer={
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px]">Discard</button>
          <PermissionButton onClick={handleCreateWork} className="flex-1 py-4 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Authorize Transformation</PermissionButton>
        </div>
      }>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <Combobox label="Processing Vendor" options={supplierOptions} value={formData.supplierId} onChange={id => setFormData({...formData, supplierId: id})} icon={<Truck className="w-4 h-4" />} />
            <Combobox label="Target Stage" options={stageOptions} value={formData.stage} onChange={id => setFormData({...formData, stage: id as StockStage})} icon={<Layers className="w-4 h-4" />} />
          </div>

          <Combobox label="Select SOURCE Stock Batch" options={batchOptions} value={formData.sourceBatchId} onChange={id => setFormData({...formData, sourceBatchId: id})} icon={<Package className="w-4 h-4" />} />

          {selectedSourceBatch && (
            <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex items-center justify-between">
               <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Inherited Unit Cost</p>
                  <p className="text-xl font-black text-indigo-600">${selectedSourceBatch.unitCost.toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Max Processable</p>
                  <p className="text-xl font-black text-indigo-600">{selectedSourceBatch.currentQuantity} <span className="text-xs">{selectedSourceBatch.unit}s</span></p>
               </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transformation Memo</label>
            <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. 5-Color Digital Printing" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity to Process</label>
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
          
          <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Estimated Final Unit Cost</p>
               <h4 className="text-3xl font-black tracking-tighter">
                 ${( (parseFloat(formData.pricePerUnit) || 0) + (selectedSourceBatch?.unitCost || 0) ).toLocaleString()}
               </h4>
             </div>
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkProcessing;
