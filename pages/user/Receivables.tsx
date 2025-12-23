
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { db } from '../../lib/db';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/Modal';
import { PermissionButton } from '../../components/PermissionButton';
import { ArrowLeftRight, User, DollarSign, History, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Customer, Transaction } from '../../types';

const Receivables: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [recoverAmount, setRecoverAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user) {
      setCustomers(db.customers.getByTenant(user.id).filter(c => c.balance > 0));
    }
  }, [user]);

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !selectedCustomer) return;

    const amount = parseFloat(recoverAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedCustomer.balance) {
      return toast.error("Invalid recovery amount.");
    }

    const transaction: Transaction = {
      id: 'rec_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'RECOVERY',
      entityId: selectedCustomer.id,
      entityName: selectedCustomer.name,
      amount: amount,
      paidAmount: amount,
      date: new Date().toISOString(),
      note: note || `Payment recovered from ${selectedCustomer.name}`
    };

    db.transactions.save(transaction);
    setCustomers(db.customers.getByTenant(user.id).filter(c => c.balance > 0));
    setIsModalOpen(false);
    setRecoverAmount('');
    setNote('');
    toast.success(`Recovery of $${amount} recorded.`);
  };

  const totalReceivables = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full overflow-y-auto pb-10 custom-scrollbar">
      <PageHeader 
        title="Accounts Receivable" 
        subtitle={`Total pending recoveries: <span class="text-emerald-600 font-bold">$${totalReceivables.toLocaleString()}</span>`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={<ArrowLeftRight className="w-16 h-16" />} 
              message="No outstanding receivables. All customer payments are up to date!" 
            />
          </div>
        ) : customers.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                <User className="w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Amount</div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">${c.balance.toLocaleString()}</div>
              </div>
            </div>
            
            <h4 className="text-xl font-black text-slate-800">{c.name}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{c.phone}</p>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => { setSelectedCustomer(c); setIsModalOpen(true); }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Record Recovery
              </button>
              <button className="p-4 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Receive Payment"
        subtitle={`From: ${selectedCustomer?.name}`}
        icon={<CheckCircle2 className="w-6 h-6" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecovery} className="p-10 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Recovered</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required 
                value={recoverAmount} 
                onChange={e => setRecoverAmount(e.target.value)} 
                type="number" 
                max={selectedCustomer?.balance}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-lg" 
                placeholder="0.00" 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 ml-1">Total Due: ${selectedCustomer?.balance.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Note</label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm h-24 resize-none" 
              placeholder="Ref No, Bank Transfer details etc."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancel</button>
            <PermissionButton type="submit" className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-100">Confirm Recovery</PermissionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Receivables;
