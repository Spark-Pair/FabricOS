
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { db } from '../../lib/db';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/Modal';
import { PermissionButton } from '../../components/PermissionButton';
import { 
  User, DollarSign, History, CheckCircle2, 
  Clock, Calendar, Hash, Tag, Building2, Printer, ChevronRight, FileText, Search, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Customer, Transaction, PaymentMode } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const ReceiptSlip: React.FC<{ data: Transaction; user: any; branch: any }> = ({ data, user, branch }) => (
  <div id="receipt-slip" className="w-full max-w-2xl bg-white border-2 border-slate-900 p-12 space-y-8 print:border-0 print:p-0 print:max-w-none">
    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 text-emerald-600">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">FabricOS</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Recovery Receipt</p>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-black uppercase tracking-widest">Receipt</h2>
        <p className="text-sm font-bold text-slate-500">REF-{data.id.slice(-8).toUpperCase()}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 text-sm">
      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issued By</p>
          <p className="font-black text-slate-800">{user?.shopName}</p>
          <p className="text-xs text-slate-500">{branch?.name}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer (Debtor)</p>
          <p className="font-black text-slate-800">{data.entityName}</p>
        </div>
      </div>
      <div className="space-y-4 text-right">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Receipt Date</p>
          <p className="font-black text-slate-800">{new Date(data.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recovered Via</p>
          <p className="font-black text-emerald-600 uppercase">{data.paymentMode}</p>
        </div>
      </div>
    </div>

    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instrument ID</span>
        <span className="font-black text-slate-800">{data.referenceNo || 'Direct Deposit'}</span>
      </div>
      <div className="h-px bg-emerald-100" />
      <div className="flex justify-between items-center">
        <span className="text-lg font-black text-slate-800 uppercase tracking-tight">Net Recovery Value</span>
        <span className="text-3xl font-black text-emerald-600 tracking-tighter">${data.amount.toLocaleString()}</span>
      </div>
    </div>

    {data.note && (
      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes</p>
        <p className="text-xs text-slate-600 italic">"{data.note}"</p>
      </div>
    )}

    <div className="flex justify-between items-end pt-12">
      <div className="w-48 border-t border-slate-300 pt-2 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Sign</p>
      </div>
      <div className="w-48 border-t border-slate-300 pt-2 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Manager</p>
      </div>
    </div>
  </div>
);

const Receivables: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  
  const [activeTab, setActiveTab] = useState<'PARTIES' | 'HISTORY'>('PARTIES');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    mode: 'CASH' as PaymentMode,
    reference: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const refreshData = () => {
    if (user) {
      setCustomers(db.customers.getByTenant(user.id).filter(c => c.balance > 0));
      setHistory(db.transactions.getAllTenant(user.id).filter(t => t.type === 'RECOVERY'));
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const filteredCustomers = useMemo(() => 
    customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), 
  [customers, searchQuery]);

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !selectedCustomer) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid recovery amount.");

    const transaction: Transaction = {
      id: 'rec_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'RECOVERY',
      entityId: selectedCustomer.id,
      entityName: selectedCustomer.name,
      amount: amount,
      paidAmount: amount,
      date: new Date(formData.date).toISOString(),
      note: formData.note,
      paymentMode: formData.mode,
      referenceNo: formData.reference,
      isCleared: formData.mode === 'CASH' || formData.mode === 'ONLINE',
      clearedAt: (formData.mode === 'CASH' || formData.mode === 'ONLINE') ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    db.transactions.save(transaction);
    refreshData();
    setIsModalOpen(false);
    setFormData({ amount: '', mode: 'CASH', reference: '', date: new Date().toISOString().split('T')[0], note: '' });
    toast.success(`Funds recovered: $${amount}. ${selectedCustomer.name}'s balance reduced.`);
  };

  const toggleClearance = (t: Transaction) => {
    const nextState = !t.isCleared;
    db.transactions.toggleClearance(t.id, nextState);
    refreshData();
    toast.success(nextState ? 'Receipt Audited' : 'Audit Reverted');
  };

  const totalReceivables = useMemo(() => customers.reduce((sum, c) => sum + c.balance, 0), [customers]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full overflow-y-auto pb-20 custom-scrollbar">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-slip, #receipt-slip * { visibility: visible; }
          #receipt-slip { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }
      `}</style>

      <PageHeader 
        title="Accounts Receivable" 
        subtitle={`Total Outstanding: <span class="text-emerald-600 font-black">$${totalReceivables.toLocaleString()}</span>. Recovered funds are credited immediately to ledgers.`}
      />

      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('PARTIES')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PARTIES' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100/50' : 'text-slate-400 hover:text-emerald-600'}`}
        >
          Recovery List
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'HISTORY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100/50' : 'text-slate-400 hover:text-emerald-600'}`}
        >
          Recovery Audit
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'PARTIES' ? (
          <motion.div 
            key="parties"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Find customer balance..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState icon={<UserCheck className="w-16 h-16" />} message="Ledgers clear! No outstanding recoveries." />
                </div>
              ) : filteredCustomers.map(c => (
                <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black transition-transform group-hover:scale-110">
                      <User className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Debtor Balance</div>
                      <div className="text-3xl font-black text-emerald-600 tracking-tighter">${c.balance.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black text-slate-800 leading-tight mb-1">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.phone}</p>

                  <div className="mt-10 pt-6 border-t border-slate-50">
                    <button 
                      onClick={() => { setSelectedCustomer(c); setIsModalOpen(true); }}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100/50 active:scale-95"
                    >
                      Record Funds Recovery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-10 py-6">Date</th>
                    <th className="px-10 py-6">Client Name</th>
                    <th className="px-10 py-6">Recovery Amount</th>
                    <th className="px-10 py-6 text-center">Audit Status</th>
                    <th className="px-10 py-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center opacity-40">
                         <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                         <p className="font-black text-xs uppercase tracking-widest">No recovery records found</p>
                      </td>
                    </tr>
                  ) : history.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-8">
                        <div className="font-bold text-slate-800">{new Date(t.date).toLocaleDateString()}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">ID: {t.id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="font-bold text-slate-800">{t.entityName}</div>
                        <div className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{t.paymentMode} ({t.referenceNo || 'Cash'})</div>
                      </td>
                      <td className="px-10 py-8 font-black text-emerald-600 text-lg">${t.amount.toLocaleString()}</td>
                      <td className="px-10 py-8 text-center">
                        <button 
                          onClick={() => toggleClearance(t)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t.isCleared ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                        >
                          {t.isCleared ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          {t.isCleared ? 'Audited' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => { setActiveTransaction(t); setIsPreviewOpen(true); }}
                          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Receipt"
        subtitle={`Crediting ledger for: ${selectedCustomer?.name}`}
        icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRecoverySubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'ONLINE', 'CHEQUE', 'SLIP'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, mode: m as PaymentMode})}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.mode === m ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receipt Value ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  required 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                  type="number" 
                  className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-emerald-500 font-black text-2xl transition-all" 
                  placeholder="0.00" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref / ID #</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  value={formData.reference} 
                  onChange={e => setFormData({...formData, reference: e.target.value})} 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-emerald-500 font-bold" 
                  placeholder="Slip No." 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receipt Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="date"
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-emerald-500 font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audit Remarks</label>
            <div className="relative">
              <Tag className="absolute left-4 top-5 w-4 h-4 text-slate-300" />
              <textarea 
                value={formData.note} 
                onChange={e => setFormData({...formData, note: e.target.value})} 
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm h-24 resize-none" 
                placeholder="Details for reconciliation..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Discard</button>
            <PermissionButton type="submit" className="flex-1 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-100 active:scale-95 transition-all">
              Commit Receipt
            </PermissionButton>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Official Receipt"
        icon={<FileText className="w-6 h-6" />}
        maxWidth="max-w-2xl"
      >
        <div className="p-10 bg-slate-100 flex flex-col items-center">
          {activeTransaction && <ReceiptSlip data={activeTransaction} user={user} branch={selectedBranch} />}
          <button 
            onClick={() => window.print()}
            className="mt-8 flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" /> Print Receipt
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Receivables;
