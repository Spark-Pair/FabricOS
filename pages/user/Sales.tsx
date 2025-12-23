
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
  CheckCircle2, Clock, Trash2, PlusCircle, FileText, Printer, Info, AlertTriangle, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Article, Customer, TransactionItem } from '../../types';

const Sales: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [sales, setSales] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewSale, setPreviewSale] = useState<any | null>(null);

  const [customerId, setCustomerId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<TransactionItem[]>([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [currentItem, setCurrentItem] = useState({ articleId: '', quantity: '', price: '' });

  useEffect(() => {
    if (user && selectedBranch) {
      setSales(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'SALE'));
      setArticles(db.articles.getByTenant(user.id));
      setCustomers(db.customers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const grandTotal = useMemo(() => invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0), [invoiceItems]);

  const selectedArticle = useMemo(() => 
    articles.find(a => a.id === currentItem.articleId), 
  [currentItem.articleId, articles]);

  const selectedArtCosting = useMemo(() => {
    if (!selectedArticle) return null;
    return {
      base: selectedArticle.basePrice,
      work: selectedArticle.workCost || 0,
      total: selectedArticle.basePrice + (selectedArticle.workCost || 0)
    };
  }, [selectedArticle]);

  const isSellingAtLoss = useMemo(() => {
    if (!selectedArtCosting || !currentItem.price) return false;
    return parseFloat(currentItem.price) < selectedArtCosting.total;
  }, [selectedArtCosting, currentItem.price]);

  const handleAddItem = () => {
    if (!selectedArticle) return toast.error("Select a fabric article.");
    
    const qty = parseFloat(currentItem.quantity);
    const prc = parseFloat(currentItem.price);
    
    if (isNaN(qty) || qty <= 0) return toast.error("Please enter a valid quantity.");
    if (isNaN(prc) || prc <= 0) return toast.error("Please enter a valid sale price.");

    // Logic: Check existing items in basket for the same article to calculate total reserved quantity
    const existingInBasket = invoiceItems
      .filter(item => item.articleId === selectedArticle.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (selectedArticle.stock < (qty + existingInBasket)) {
      return toast.error(`Insufficient stock! Only ${selectedArticle.stock - existingInBasket} ${selectedArticle.unit}s left.`);
    }

    if (isSellingAtLoss) {
      toast("Caution: Selling below cost price!", { icon: '⚠️', style: { borderRadius: '10px', background: '#fffbeb', color: '#92400e' } });
    }

    setInvoiceItems([...invoiceItems, {
      articleId: selectedArticle.id,
      articleName: selectedArticle.name,
      quantity: qty,
      unit: selectedArticle.unit,
      price: prc
    }]);
    
    setCurrentItem({ articleId: '', quantity: '', price: '' });
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !customerId || invoiceItems.length === 0) {
      return toast.error("Incomplete invoice data.");
    }

    // Final stock validation before saving
    for (const item of invoiceItems) {
      const art = articles.find(a => a.id === item.articleId);
      if (!art || art.stock < item.quantity) {
        return toast.error(`Critical error: ${item.articleName} stock changed during entry.`);
      }
    }

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
      items: invoiceItems
    };

    db.transactions.save(sale as any);
    
    // Refresh local state
    setSales([sale, ...sales]);
    setArticles(db.articles.getByTenant(user.id));
    setIsModalOpen(false);
    setInvoiceItems([]);
    setCustomerId('');
    setPaidAmount('');
    toast.success('Sale successfully completed!');
  };

  const customerOptions = customers.map(c => ({ id: c.id, label: c.name, sublabel: c.phone }));
  const articleOptions = articles.map(a => {
    const totalCost = a.basePrice + (a.workCost || 0);
    return { 
      id: a.id, 
      label: a.name, 
      sublabel: `Stock: ${a.stock} ${a.unit}s | Unit Cost: $${totalCost}`,
      disabled: a.stock <= 0
    };
  });

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
        title="Sales & Invoicing" 
        subtitle={`Live stock control and revenue management for <span class="text-indigo-600 font-bold">${selectedBranch?.name}</span>.`}
        actions={
          <>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> New Invoice
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
                <th className="px-10 py-6">Customer</th>
                <th className="px-10 py-6">Stock Items</th>
                <th className="px-10 py-6">Invoice Total</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map((s) => (
                <tr key={s.id} onClick={() => setPreviewSale(s)} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {s.entityName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-base">{s.entityName}</div>
                        <div className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                          <Hash className="w-3 h-3" /> INV-{s.id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">{s.items?.length} Articles Sold</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xl font-black text-slate-900 tracking-tight">${s.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${(s.amount - s.paidAmount) <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {(s.amount - s.paidAmount) <= 0 ? 'Settled' : 'Dues Pending'}
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
          {sales.length === 0 && <EmptyState icon={<Receipt className="w-16 h-16" />} message="No sales records available" />}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Sale Invoice" icon={<PlusCircle className="w-6 h-6" />} maxWidth="max-w-2xl" footer={
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
          <PermissionButton onClick={handleCreateSale} className="flex-1 py-4 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Execute & Save</PermissionButton>
        </div>
      }>
        <div className="p-6 space-y-6">
          <Combobox label="Select Customer" placeholder="Search customer database..." options={customerOptions} value={customerId} onChange={setCustomerId} icon={<User className="w-4 h-4" />} />
          
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden min-h-[100px] shadow-inner">
            {invoiceItems.length === 0 ? <div className="py-10 text-center opacity-40 italic text-sm">Basket is currently empty.</div> : (
              <div className="divide-y divide-slate-50">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.articleName}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{item.quantity} {item.unit}s × ${item.price}</p>
                    </div>
                    <button onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="p-5 bg-emerald-50/30 flex justify-between items-center"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Grand Total</span><span className="text-2xl font-black text-emerald-600 tracking-tighter">${grandTotal.toLocaleString()}</span></div>
              </div>
            )}
          </div>

          {selectedArtCosting && (
            <div className={`p-5 rounded-[2rem] border transition-all flex items-center gap-4 ${isSellingAtLoss ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
              <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${isSellingAtLoss ? 'text-rose-500' : 'text-indigo-600'}`}>
                {isSellingAtLoss ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <Info className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.15em] ${isSellingAtLoss ? 'text-rose-600' : 'text-indigo-400'}`}>
                  {isSellingAtLoss ? 'Loss Warning Detected' : 'Pricing Intelligence'}
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Procurement: ${selectedArtCosting.base} + Services: ${selectedArtCosting.work} = <span className="font-black text-slate-900">Total Unit Cost: ${selectedArtCosting.total}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avail. Stock</div>
                <div className={`text-sm font-black ${selectedArticle!.stock < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedArticle!.stock} {selectedArticle!.unit}s</div>
              </div>
            </div>
          )}

          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] space-y-5">
            <Combobox placeholder="Search fabrics..." options={articleOptions} value={currentItem.articleId} onChange={id => {
              const art = articles.find(a => a.id === id);
              setCurrentItem({...currentItem, articleId: id, price: art?.basePrice.toString() || ''});
            }} icon={<Package className="w-4 h-4" />} />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Qty</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} type="number" className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Rate</label>
                <div className="relative">
                  <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSellingAtLoss ? 'text-rose-500' : 'text-slate-300'}`} />
                  <input value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} type="number" className={`w-full pl-11 pr-4 py-4 bg-white border rounded-2xl font-bold focus:ring-2 outline-none transition-all ${isSellingAtLoss ? 'border-rose-300 focus:ring-rose-200 ring-4 ring-rose-50 text-rose-600' : 'border-slate-200 focus:ring-indigo-500 text-slate-700'}`} placeholder="0.00" />
                </div>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={handleAddItem} 
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isSellingAtLoss ? 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'}`}
            >
              Add Item to Basket
            </button>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cash Received Now</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input value={paidAmount} onChange={e => setPaidAmount(e.target.value)} type="number" className="w-full pl-11 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-lg focus:ring-4 focus:ring-emerald-50 outline-none transition-all" placeholder="Enter amount..." />
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!previewSale} onClose={() => setPreviewSale(null)} title="Official Sale Invoice" icon={<Receipt className="w-6 h-6" />} maxWidth="max-w-4xl" footer={
        <div className="flex gap-4 no-print">
          <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><Printer className="w-5 h-5" /> Execute Print</button>
          <button onClick={() => setPreviewSale(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all">Dismiss</button>
        </div>
      }>
        <div className="p-6 md:p-10 bg-slate-100/50 flex flex-col items-center">
          <InvoicePreview type="SALE" data={previewSale} user={user} branch={selectedBranch} entity={customers.find(c => c.id === previewSale?.entityId)} />
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
