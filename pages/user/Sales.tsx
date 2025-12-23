
import React, { useState, useEffect, useMemo } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Combobox } from '../../components/Combobox';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { InvoicePreview } from '../../components/business/InvoicePreview';
import {
  Plus, Receipt, User, DollarSign, Package, Ruler, Hash, Filter, ChevronRight,
  CheckCircle2, Clock, Trash2, PlusCircle, FileText, Printer, Info, AlertTriangle, ShieldAlert, Layers, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Article, Customer, TransactionItem, StockBatch, StockStage } from '../../types';

const Sales: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [sales, setSales] = useState<any[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewSale, setPreviewSale] = useState<any | null>(null);

  const [customerId, setCustomerId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<TransactionItem[]>([]);
  const [paidAmount, setPaidAmount] = useState('');
  
  // Selection State
  const [selectedStage, setSelectedStage] = useState<StockStage>('FINISHED');
  const [currentItem, setCurrentItem] = useState({ batchId: '', quantity: '', price: '' });

  useEffect(() => {
    if (user && selectedBranch) {
      setSales(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'SALE'));
      setBatches(db.batches.getByTenant(user.id).filter(b => b.currentQuantity > 0));
      setCustomers(db.customers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const grandTotal = useMemo(() => invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0), [invoiceItems]);

  const availableBatchesForStage = useMemo(() => 
    batches.filter(b => b.stage === selectedStage), 
  [batches, selectedStage]);

  const selectedBatch = useMemo(() => 
    batches.find(b => b.id === currentItem.batchId), 
  [currentItem.batchId, batches]);

  const isSellingAtLoss = useMemo(() => {
    if (!selectedBatch || !currentItem.price) return false;
    return parseFloat(currentItem.price) < selectedBatch.unitCost;
  }, [selectedBatch, currentItem.price]);

  const handleAddItem = () => {
    if (!selectedBatch) return toast.error("Select a stock batch.");
    const qty = parseFloat(currentItem.quantity);
    const prc = parseFloat(currentItem.price);
    
    if (isNaN(qty) || qty <= 0) return toast.error("Invalid quantity.");
    if (isNaN(prc) || prc <= 0) return toast.error("Invalid sale price.");

    if (selectedBatch.currentQuantity < qty) {
      return toast.error(`Insufficient stock! ${selectedBatch.currentQuantity} ${selectedBatch.unit}s available.`);
    }

    setInvoiceItems([...invoiceItems, {
      articleId: selectedBatch.articleId,
      articleName: selectedBatch.articleName,
      batchId: selectedBatch.id,
      quantity: qty,
      unit: selectedBatch.unit,
      price: prc,
      unitCost: selectedBatch.unitCost
    }]);
    
    setCurrentItem({ batchId: '', quantity: '', price: '' });
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !customerId || invoiceItems.length === 0) return toast.error("Incomplete invoice.");

    try {
      const sale = {
        id: 's_' + Date.now(),
        tenantId: user.id,
        branchId: selectedBranch.id,
        type: 'SALE' as const,
        entityId: customerId,
        entityName: customers.find(c => c.id === customerId)?.name || '',
        amount: grandTotal,
        paidAmount: parseFloat(paidAmount) || 0,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        items: invoiceItems
      };

      db.transactions.save(sale as any);
      setSales([sale, ...sales]);
      setBatches(db.batches.getByTenant(user.id).filter(b => b.currentQuantity > 0));
      setIsModalOpen(false);
      setInvoiceItems([]);
      setCustomerId('');
      setPaidAmount('');
      toast.success('Sale finalized!');
    } catch (err: any) {
      toast.error(err.message || "Failed to save sale.");
    }
  };

  const stageOptions = [
    { id: 'RAW', label: 'Raw Fabric' },
    { id: 'PRINTED', label: 'Printed' },
    { id: 'DYED', label: 'Dyed' },
    { id: 'EMBROIDERED', label: 'Embroidered' },
    { id: 'FINISHED', label: 'Finished Stock' }
  ];

  const batchOptions = availableBatchesForStage.map(b => ({ 
    id: b.id, 
    label: `${b.articleName} (ID: ${b.id.slice(-5)})`, 
    sublabel: `Cost: $${b.unitCost} | Avail: ${b.currentQuantity} ${b.unit}s` 
  }));

  const customerOptions = customers.map(c => ({ id: c.id, label: c.name, sublabel: c.phone }));

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 relative overflow-hidden h-full pb-20 custom-scrollbar">
      <PageHeader 
        title="Sales Inventory Control" 
        subtitle="Enforcing strict batch-wise costing and stock tracking."
        actions={
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Create Sale
          </button>
        }
      />

      <div className="bg-white rounded-[3rem] border border-slate-100 h-full shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Customer</th>
                <th className="px-10 py-6">Stock Origin</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6">Collection</th>
                <th className="px-10 py-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map((s) => (
                <tr key={s.id} onClick={() => setPreviewSale(s)} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="font-black text-slate-800 text-base">{s.entityName}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: INV-{s.id.slice(-6)}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xs font-bold text-slate-600">
                      {s.items?.[0]?.articleName} 
                      <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded-md text-[9px] uppercase">Batch: {s.items?.[0]?.batchId?.slice(-5)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-xl font-black text-slate-900 tracking-tight">${s.amount.toLocaleString()}</td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${(s.amount - s.paidAmount) <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {(s.amount - s.paidAmount) <= 0 ? 'Settled' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right"><ChevronRight className="w-5 h-5 text-slate-300 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && <EmptyState icon={<Receipt className="w-16 h-16" />} message="No sale records" />}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Batch-Locked Sale" icon={<PlusCircle className="w-6 h-6" />} maxWidth="max-w-2xl" footer={
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
          <PermissionButton onClick={handleCreateSale} className="flex-1 py-4 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Execute Invoice</PermissionButton>
        </div>
      }>
        <div className="p-10 space-y-8">
          <Combobox label="Client / Debtor" options={customerOptions} value={customerId} onChange={setCustomerId} icon={<User className="w-4 h-4" />} />
          
          <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200">
            <div className="grid grid-cols-2 gap-4 mb-6">
               <Combobox label="Select Stage" options={stageOptions} value={selectedStage} onChange={val => {
                 setSelectedStage(val as StockStage);
                 setCurrentItem({...currentItem, batchId: ''});
               }} icon={<Layers className="w-4 h-4" />} />
               
               <Combobox label="Select Batch" options={batchOptions} value={currentItem.batchId} onChange={id => {
                 const b = batches.find(x => x.id === id);
                 setCurrentItem({...currentItem, batchId: id, price: (b?.unitCost || 0).toString()});
               }} icon={<Hash className="w-4 h-4" />} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                <input value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} type="number" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price</label>
                <input value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} type="number" className={`w-full px-5 py-4 bg-white border rounded-2xl font-bold transition-all ${isSellingAtLoss ? 'border-rose-400 text-rose-600 ring-4 ring-rose-50' : 'border-slate-200'}`} placeholder="0.00" />
              </div>
            </div>

            {isSellingAtLoss && <div className="mt-4 flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-widest"><ShieldAlert className="w-4 h-4" /> Margin Alert: Price is below Batch Cost!</div>}
            
            <button type="button" onClick={handleAddItem} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100">Add to Basket</button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-inner">
            {invoiceItems.length === 0 ? <div className="py-10 text-center text-slate-300 italic text-sm">Basket is empty.</div> : (
              <div className="divide-y divide-slate-50">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.articleName} <span className="text-[9px] text-slate-400 font-black uppercase ml-2 opacity-50">Batch: {item.batchId.slice(-5)}</span></p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{item.quantity} {item.unit}s × ${item.price}</p>
                    </div>
                    <button onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="p-5 bg-emerald-50/30 flex justify-between items-center"><span className="text-[10px] font-black text-emerald-600 uppercase">Grand Total</span><span className="text-2xl font-black text-emerald-600 tracking-tighter">${grandTotal.toLocaleString()}</span></div>
              </div>
            )}
          </div>
          
          <input value={paidAmount} onChange={e => setPaidAmount(e.target.value)} type="number" className="w-full p-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-inner outline-none focus:ring-4 focus:ring-indigo-500 transition-all" placeholder="Enter Amount Collected Now..." />
        </div>
      </Modal>

      <Modal isOpen={!!previewSale} onClose={() => setPreviewSale(null)} title="Official Invoice" icon={<Receipt className="w-6 h-6" />} maxWidth="max-w-4xl">
        <div className="p-10 bg-slate-50 flex justify-center">
          <InvoicePreview type="SALE" data={previewSale} user={user} branch={selectedBranch} entity={customers.find(c => c.id === previewSale?.entityId)} />
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
