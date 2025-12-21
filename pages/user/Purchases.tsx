
import React, { useState, useEffect, useMemo } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { PermissionButton } from '../../components/PermissionButton';
import { Combobox } from '../../components/Combobox';
import { Modal } from '../../components/Modal';
import {
  Plus,
  Truck,
  User,
  DollarSign,
  Package,
  Ruler,
  Filter,
  CheckCircle2,
  Clock,
  Hash,
  EllipsisVertical,
  Trash2,
  ShoppingBag,
  PlusCircle,
  FileText,
  Calendar,
  Building2,
  Printer,
  ChevronRight,
  Phone,
  MapPin,
  Signature
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Invoice State
  const [supplierId, setSupplierId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<TransactionItem[]>([]);

  // Current Item Entry State
  const [currentItem, setCurrentItem] = useState({
    articleId: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    if (user && selectedBranch) {
      setPurchases(db.transactions.getByBranch(user.id, selectedBranch.id).filter(t => t.type === 'PURCHASE'));
      setArticles(db.articles.getByTenant(user.id));
      setSuppliers(db.suppliers.getByTenant(user.id));
    }
  }, [user, selectedBranch]);

  const grandTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }, [invoiceItems]);

  const handleAddItem = () => {
    const selectedArt = articles.find(a => a.id === currentItem.articleId);
    if (!selectedArt) return toast.error("Select a fabric article first.");

    const qty = parseFloat(currentItem.quantity);
    const prc = parseFloat(currentItem.price);

    if (isNaN(qty) || qty <= 0) return toast.error("Enter a valid quantity.");
    if (isNaN(prc) || prc <= 0) return toast.error("Enter a valid price.");

    const newItem: TransactionItem = {
      articleId: selectedArt.id,
      articleName: selectedArt.name,
      quantity: qty,
      unit: selectedArt.unit,
      price: prc
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setCurrentItem({ articleId: '', quantity: '', price: '' });
    toast.success(`${selectedArt.name} added to invoice.`);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch) return;

    if (!supplierId) return toast.error("Please select a supplier.");
    if (invoiceItems.length === 0) return toast.error("Please add at least one item to the invoice.");

    const selectedSup = suppliers.find(s => s.id === supplierId);
    if (!selectedSup) return;

    const purchase = {
      id: 'p_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'PURCHASE' as const,
      entityId: selectedSup.id,
      entityName: selectedSup.name,
      amount: grandTotal,
      paidAmount: 0, 
      date: new Date().toISOString(),
      items: invoiceItems
    };

    db.transactions.save(purchase as any);
    setPurchases([purchase, ...purchases]);
    setIsModalOpen(false);

    // Reset form
    setSupplierId('');
    setInvoiceItems([]);
    setCurrentItem({ articleId: '', quantity: '', price: '' });

    toast.success('Procurement invoice saved successfully!');
  };

  const supplierOptions = suppliers.map(s => ({
    id: s.id,
    label: s.name,
    sublabel: s.phone
  }));

  const articleOptions = articles.map(a => ({
    id: a.id,
    label: a.name,
    sublabel: `Unit: ${a.unit} | Stock: ${a.stock}`
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            border: none !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Create Purchase Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Procurement Entry"
        subtitle="Stock Restock Invoice"
        icon={<PlusCircle className="w-6 h-6" />}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex gap-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
            <PermissionButton onClick={handleCreatePurchase} className="flex-1 py-4 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Save Invoice</PermissionButton>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <Combobox 
              label="Supplier"
              placeholder="Select supplier..."
              options={supplierOptions}
              value={supplierId}
              onChange={(id) => setSupplierId(id)}
              icon={<Truck className="w-4 h-4" />}
            />
          </section>

          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Draft Items</h4>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden min-h-[100px]">
              {invoiceItems.length === 0 ? (
                <div className="py-10 text-center opacity-40 italic text-sm">No items added yet.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between group">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{item.articleName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {item.quantity} {item.unit}s × ${item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 px-2">
                        <p className="font-black text-slate-900 text-sm">${(item.quantity * item.price).toLocaleString()}</p>
                        <button onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-indigo-50/30 flex justify-between items-center border-t border-indigo-100/50">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Running Total</span>
                    <span className="text-lg font-black text-indigo-600">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
            <Combobox 
              placeholder="Select fabric..."
              options={articleOptions}
              value={currentItem.articleId}
              onChange={(id) => setCurrentItem({...currentItem, articleId: id})}
              icon={<Package className="w-4 h-4" />}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} type="number" className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Qty" />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} type="number" className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Price" />
              </div>
            </div>
            <button type="button" onClick={handleAddItem} className="w-full py-3 bg-white border border-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Add To Invoice</button>
          </section>
        </div>
      </Modal>

      {/* Invoice Professional Preview Modal */}
      <Modal
        isOpen={!!previewPurchase}
        onClose={() => setPreviewPurchase(null)}
        title="Purchase Document"
        subtitle={`System ID: ${previewPurchase?.id.slice(-6)}`}
        icon={<FileText className="w-6 h-6" />}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex gap-4 no-print">
            <button 
              onClick={handlePrint}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
            >
              <Printer className="w-5 h-5" /> Execute Print
            </button>
            <button 
              onClick={() => setPreviewPurchase(null)}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              Dismiss
            </button>
          </div>
        }
      >
        <div className="p-6 md:p-10 bg-slate-100/50 flex flex-col items-center">
          {/* Document Container */}
          <div 
            id="invoice-print-area" 
            className="w-full max-w-[800px] bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden p-10 md:p-14 space-y-12 min-h-[1056px] flex flex-col transition-all"
          >
            {/* Professional Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-black text-indigo-600 tracking-tighter leading-none">FabricFlow</h1>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Management Systems</p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-slate-800 font-black text-base">
                    <Building2 className="w-4 h-4 text-indigo-500" /> {user?.shopName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3 h-3" /> {selectedBranch?.name} — {selectedBranch?.address}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Phone className="w-3 h-3" /> {user?.phoneNumber}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-4">
                <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter opacity-50">Invoice</h2>
                <div className="space-y-1 pt-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document No.</p>
                  <p className="font-black text-slate-900 text-lg font-mono tracking-tight">PUR-{previewPurchase?.id.slice(-8)}</p>
                </div>
              </div>
            </div>

            {/* Billing Info Grid */}
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">Procured From</p>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800">{previewPurchase?.entityName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                    <Phone className="w-3 h-3 text-indigo-400" /> {suppliers.find(s => s.id === previewPurchase?.entityId)?.phone || 'N/A'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic">Registered Textile Vendor</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issue Date</p>
                <div className="flex items-center justify-end gap-2 text-slate-800 font-black text-base">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {previewPurchase && new Date(previewPurchase.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Status</p>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-widest ${previewPurchase?.amount === previewPurchase?.paidAmount ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {previewPurchase?.amount === previewPurchase?.paidAmount ? 'Settled' : 'Unpaid Entry'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Itemized Table */}
            <div className="flex-1">
              <div className="rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-100">
                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4">Fabric Item</th>
                      <th className="px-4 py-4 text-center">Unit</th>
                      <th className="px-4 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-center">Rate</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700 text-xs">
                    {previewPurchase?.items?.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-black text-slate-800">{item.articleName}</div>
                          <div className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase">Batch #{previewPurchase?.id.slice(-4)}-{i+1}</div>
                        </td>
                        <td className="px-4 py-5 text-center text-[10px] uppercase text-slate-400">{item.unit}</td>
                        <td className="px-4 py-5 text-center font-black text-slate-900">{item.quantity}</td>
                        <td className="px-6 py-5 text-center">${item.price.toLocaleString()}</td>
                        <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight">${(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-t-2 border-slate-100 pt-10 mt-auto">
              <div className="space-y-8 flex-1">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Procurement Terms</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm font-medium">
                    This document validates stock entry into the inventory system. 
                    Discrepancies must be reported within 24 hours of receipt. 
                    Authorized for internal record keeping.
                  </p>
                </div>
                <div className="flex gap-12 pt-8">
                   <div className="w-40 space-y-3 border-t border-slate-200 pt-3">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Prepared By</p>
                      <p className="text-[10px] font-bold text-slate-800 text-center truncate">{user?.ownerName}</p>
                   </div>
                   <div className="w-40 space-y-3 border-t border-slate-200 pt-3">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Store Manager</p>
                      <div className="h-4 flex items-center justify-center">
                        <Signature className="w-4 h-4 text-indigo-50/50" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-72 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-2">
                  <span>Gross Subtotal</span>
                  <span>${previewPurchase?.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-2">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="h-px bg-slate-100 my-1"></div>
                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Final Total</span>
                  <span className="text-2xl font-black tracking-tighter">${previewPurchase?.amount.toLocaleString()}</span>
                </div>
                <p className="text-[9px] text-center text-slate-300 font-bold italic pt-1 tracking-tight">FabricFlow Cloud Generation — Official Entry</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative overflow-hidden h-full pb-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Procurement Ledger</h2>
            <p className="text-slate-500 mt-2 font-medium italic">Tracking stock inflows for <span className="text-indigo-600 font-bold">{selectedBranch?.name}</span>.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              <Plus className="w-5 h-5" /> New Purchase
            </button>
            <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[3rem] border border-slate-100 h-full shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="px-10 py-6">Supplier Source</th>
                  <th className="px-10 py-6">Stock Items</th>
                  <th className="px-10 py-6">Invoice Worth</th>
                  <th className="px-10 py-6">Financial Status</th>
                  <th className="px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map((p) => {
                  const isPaid = (p.amount - p.paidAmount) <= 0;
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setPreviewPurchase(p)}
                      className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                    >
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
                          {(p.items?.length || 0) > 3 && (
                            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                              +{p.items.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 font-bold text-slate-500 text-[10px] uppercase tracking-wider">{p.items?.length} Articles</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-xl font-black text-slate-900 tracking-tight">${p.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {isPaid ? 'Settled' : 'Pending'}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all shadow-sm">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {purchases.length === 0 && (
              <div className="text-center py-40 opacity-40">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Purchases;
