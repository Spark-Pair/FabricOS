
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
  Plus, Truck, User, DollarSign, Package, Ruler, Filter, CheckCircle2,
  Clock, Hash, Trash2, PlusCircle, FileText, ChevronRight, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Article, Supplier, TransactionItem } from '../../types';

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPurchase, setPreviewPurchase] = useState<any | null>(null);

  const [supplierId, setSupplierId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<TransactionItem[]>([]);
  const [currentItem, setCurrentItem] = useState({ articleId: '', quantity: '', price: '' });

  useEffect(() => {
    if (user && selectedBranch) {
      setPurchases(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'PURCHASE'));
      setArticles(db.articles.getByTenant(user.id));
      setSuppliers(db.suppliers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const grandTotal = useMemo(() => invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0), [invoiceItems]);

  const handleAddItem = () => {
    const selectedArt = articles.find(a => a.id === currentItem.articleId);
    if (!selectedArt) return toast.error("Select a fabric first.");
    const qty = parseFloat(currentItem.quantity);
    const prc = parseFloat(currentItem.price);
    if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) return toast.error("Invalid input.");

    // Fix: Added missing batchId and unitCost to satisfy TransactionItem interface requirements
    // For a purchase, unitCost is the purchase price and batchId is assigned when saved to DB
    setInvoiceItems([...invoiceItems, {
      articleId: selectedArt.id,
      articleName: selectedArt.name,
      batchId: '', // Populated by db.transactions.save during purchase processing
      quantity: qty,
      unit: selectedArt.unit,
      price: prc,
      unitCost: prc
    }]);
    setCurrentItem({ articleId: '', quantity: '', price: '' });
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !supplierId || invoiceItems.length === 0) return toast.error("Incomplete invoice.");

    const purchase = {
      id: 'p_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'PURCHASE' as const,
      entityId: supplierId,
      entityName: suppliers.find(s => s.id === supplierId)?.name || '',
      amount: grandTotal,
      paidAmount: 0, 
      date: new Date().toISOString(),
      items: invoiceItems
    };

    db.transactions.save(purchase as any);
    setPurchases([purchase, ...purchases]);
    setIsModalOpen(false);
    setInvoiceItems([]);
    setSupplierId('');
    toast.success('Invoice saved!');
  };

  const supplierOptions = suppliers.map(s => ({ id: s.id, label: s.name, sublabel: s.phone }));
  const articleOptions = articles.map(a => ({ id: a.id, label: a.name, sublabel: `Unit: ${a.unit}` }));

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 relative overflow-hidden h-full pb-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <PageHeader 
        title="Procurement Ledger" 
        subtitle={`Tracking stock inflows for <span class="text-indigo-600 font-bold">${selectedBranch?.name}</span>.`}
        actions={
          <>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> New Purchase
            </button>
            <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </>
        }
      />

      <div className="bg-white rounded-[3rem] border border-slate-100 h-full shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Supplier Source</th>
                <th className="px-10 py-6">Stock Items</th>
                <th className="px-10 py-6">Invoice Worth</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchases.map((p) => (
                <tr key={p.id} onClick={() => setPreviewPurchase(p)} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {p.entityName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-base">{p.entityName}</div>
                        <div className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                          <Hash className="w-3 h-3" /> PUR-{p.id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex -space-x-2">
                      {p.items?.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase border border-indigo-200 shadow-sm">
                          {item.articleName.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 font-bold text-slate-500 text-[10px] uppercase tracking-wider">{p.items?.length} Articles</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xl font-black text-slate-900 tracking-tight">${p.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${(p.amount - p.paidAmount) <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {(p.amount - p.paidAmount) <= 0 ? 'Settled' : 'Pending'}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 group-hover:text-indigo-600 transition-all shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {purchases.length === 0 && <EmptyState icon={<FileText className="w-16 h-16" />} message="No records found" />}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Procurement Entry" icon={<PlusCircle className="w-6 h-6" />} maxWidth="max-w-2xl" footer={
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
          <PermissionButton onClick={handleCreatePurchase} className="flex-1 py-4 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Save Invoice</PermissionButton>
        </div>
      }>
        <div className="p-6 space-y-6">
          <Combobox label="Supplier" placeholder="Select supplier..." options={supplierOptions} value={supplierId} onChange={setSupplierId} icon={<Truck className="w-4 h-4" />} />
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden min-h-[100px]">
            {invoiceItems.length === 0 ? <div className="py-10 text-center opacity-40 italic text-sm">No items added yet.</div> : (
              <div className="divide-y divide-slate-50">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.articleName}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{item.quantity} {item.unit}s × ${item.price}</p>
                    </div>
                    <button onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="p-4 bg-indigo-50/30 flex justify-between items-center"><span className="text-[9px] font-black text-indigo-400 uppercase">Total</span><span className="text-lg font-black text-indigo-600">${grandTotal.toLocaleString()}</span></div>
              </div>
            )}
          </div>
          <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
            <Combobox placeholder="Select fabric..." options={articleOptions} value={currentItem.articleId} onChange={id => setCurrentItem({...currentItem, articleId: id})} icon={<Package className="w-4 h-4" />} />
            <div className="grid grid-cols-2 gap-3">
              <input value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" placeholder="Qty" />
              <input value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" placeholder="Price" />
            </div>
            <button type="button" onClick={handleAddItem} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase">Add To Invoice</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!previewPurchase} onClose={() => setPreviewPurchase(null)} title="Purchase Document" icon={<FileText className="w-6 h-6" />} maxWidth="max-w-4xl" footer={
        <div className="flex gap-4 no-print">
          <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-3 shadow-xl active:scale-95"><Printer className="w-5 h-5" /> Execute Print</button>
          <button onClick={() => setPreviewPurchase(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95">Dismiss</button>
        </div>
      }>
        <div className="p-6 md:p-10 bg-slate-100/50 flex flex-col items-center">
          <InvoicePreview type="PURCHASE" data={previewPurchase} user={user} branch={selectedBranch} entity={suppliers.find(s => s.id === previewPurchase?.entityId)} />
        </div>
      </Modal>
    </div>
  );
};

export default Purchases;
