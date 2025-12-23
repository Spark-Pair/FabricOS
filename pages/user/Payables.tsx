
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { db } from '../../lib/db';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/Modal';
import { PermissionButton } from '../../components/PermissionButton';
import { CreditCard, Wallet, Truck, DollarSign, History, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Supplier, Transaction } from '../../types';

const Payables: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useTenant();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user) {
      setSuppliers(db.suppliers.getByTenant(user.id).filter(s => s.balance > 0));
    }
  }, [user]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBranch || !selectedSupplier) return;

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedSupplier.balance) {
      return toast.error("Invalid payment amount.");
    }

    const transaction: Transaction = {
      id: 'pay_' + Date.now(),
      tenantId: user.id,
      branchId: selectedBranch.id,
      type: 'PAYMENT',
      entityId: selectedSupplier.id,
      entityName: selectedSupplier.name,
      amount: amount,
      paidAmount: amount,
      date: new Date().toISOString(),
      note: note || `Payment made to ${selectedSupplier.name}`
    };

    db.transactions.save(transaction);
    setSuppliers(db.suppliers.getByTenant(user.id).filter(s => s.balance > 0));
    setIsModalOpen(false);
    setPayAmount('');
    setNote('');
    toast.success(`Payment of $${amount} recorded.`);
  };

  const totalPayables = suppliers.reduce((sum, s) => sum + s.balance, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full overflow-y-auto pb-10 custom-scrollbar">
      <PageHeader 
        title="Accounts Payable" 
        subtitle={`Total outstanding debt: <span class="text-rose-600 font-bold">$${totalPayables.toLocaleString()}</span>`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={<CreditCard className="w-16 h-16" />} 
              message="No outstanding payables found. Your accounts are settled!" 
            />
          </div>
        ) : suppliers.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black">
                <Truck className="w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Owed</div>
                <div className="text-2xl font-black text-rose-600 tracking-tight">${s.balance.toLocaleString()}</div>
              </div>
            </div>
            
            <h4 className="text-xl font-black text-slate-800">{s.name}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{s.phone}</p>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => { setSelectedSupplier(s); setIsModalOpen(true); }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Clear Dues
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
        title="Record Payment"
        subtitle={`To: ${selectedSupplier?.name}`}
        icon={<Wallet className="w-6 h-6" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePayment} className="p-10 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required 
                value={payAmount} 
                onChange={e => setPayAmount(e.target.value)} 
                type="number" 
                max={selectedSupplier?.balance}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-lg" 
                placeholder="0.00" 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 ml-1">Max available: ${selectedSupplier?.balance.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm h-24 resize-none" 
              placeholder="Cheque No, Cash reference etc."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancel</button>
            <PermissionButton type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Execute Payment</PermissionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payables;
