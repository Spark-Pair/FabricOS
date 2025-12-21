
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
  PlusCircle
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
      paidAmount: 0, // No cash paid field, assume full payable
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

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Procurement Invoice"
        subtitle="Multi-item Stock Entry"
        icon={<ShoppingBag className="w-7 h-7" />}
        maxWidth="max-w-2xl"
      >
        <div className="p-8 space-y-8">
          {/* Supplier Section */}
          <section className="space-y-4">
            <Combobox
              label="Supplier"
              placeholder="Search supplier name..."
              options={supplierOptions}
              value={supplierId}
              onChange={(id) => setSupplierId(id)}
              icon={<User className="w-4 h-4" />}
            />
          </section>

          {/* Item List Display */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Invoice Items</h4>
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden min-h-[120px]">
              {invoiceItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-300 font-bold italic text-sm">Add fabrics using the form below.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between group bg-white hover:bg-indigo-50/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-sm truncate">{item.articleName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {item.quantity} {item.unit}s × ${item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 px-4">
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">${(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-6 bg-indigo-50/50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Grand Total</span>
                    <span className="text-2xl font-black text-indigo-600 tracking-tighter">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Add Item Form */}
          <section className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Add Next Fabric</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Combobox
                placeholder="Select fabric..."
                options={articleOptions}
                value={currentItem.articleId}
                onChange={(id) => setCurrentItem({ ...currentItem, articleId: id })}
                icon={<Package className="w-4 h-4" />}
                className="md:col-span-2"
              />
              <div className="space-y-1">
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    value={currentItem.quantity}
                    onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    type="number"
                    step="0.01"
                    className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
                    placeholder="Quantity"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    value={currentItem.price}
                    onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })}
                    type="number"
                    className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
                    placeholder="Price per unit"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
            >
              Add to Invoice
            </button>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs"
            >
              Discard
            </button>
            <PermissionButton
              onClick={handleCreatePurchase}
              className="flex-1 py-5 shadow-2xl shadow-indigo-100 font-black uppercase tracking-widest text-xs"
            >
              Save Invoice (${grandTotal.toLocaleString()})
            </PermissionButton>
          </div>
        </div>
      </Modal>
      <div className="max-w-7xl mx-auto flex flex-col gap-5 relative overflow-hidden h-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Procurement</h2>
            <p className="text-slate-500 mt-2 font-medium italic">Restocking inventory for <span className="text-indigo-600 font-bold">{selectedBranch?.name}</span> outlet.</p>
          </div>
          <div className="flex gap-3.5 items-center">
            <button onClick={() => setIsModalOpen(true)} className="grow flex items-center gap-3.5 px-5 py-3.5 bg-indigo-600 border border-indigo-600 text-white font-medium text-sm tracking-wider rounded-2xl hover:bg-indigo-600 transition-all duration-300">
              <Plus size={18} /> Add Record
            </button>
            <button className="grow flex items-center gap-3.5 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 font-medium text-sm tracking-wider rounded-2xl hover:bg-slate-100 transition-all duration-300">
              <Filter size={16} /> Advanced Filters
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl border border-slate-200 h-full shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-scrool h-full flex flex-col">
            <table className="w-full text-left">
              <thead className="sticky top-0">
                <tr className="bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-200">
                  <th className="px-6 py-5">Supplier Details</th>
                  <th className="px-6 py-5">Fabric Items</th>
                  <th className="px-6 py-5">Invoice Total</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => {
                  const balance = p.amount - p.paidAmount;
                  const isPaid = balance <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                            {p.entityName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-slate-800 text-base">{p.entityName}</div>
                            <div className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                              <Hash className="w-3 h-3" /> PO-{p.id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2 overflow-hidden">
                          {p.items?.slice(0, 3).map((item: TransactionItem, i: number) => (
                            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase border border-indigo-200" title={item.articleName}>
                              {item.articleName.charAt(0)}
                            </div>
                          ))}
                          {(p.items?.length || 0) > 3 && (
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                              +{p.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 font-bold text-slate-600 text-xs">
                          {p.items?.length} {p.items?.length === 1 ? 'article' : 'articles'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xl font-black text-slate-900 tracking-tight">${p.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {isPaid ? 'Cleared' : `Unpaid: $${balance}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-indigo-600 px-4">
                          <EllipsisVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {purchases.length === 0 && (
              <div className="text-center grow grid items-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <Truck className="w-10 h-10" />
                  </div>
                  <p className="text-slate-400 font-black italic text-lg">No procurement records found.</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-black hover:underline text-sm uppercase tracking-widest">Restock your inventory</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Purchases;
