
import React from 'react';
import { Building2, MapPin, Phone, Calendar, Signature } from 'lucide-react';
import { UserProfile, Branch, Supplier, Customer } from '../../types';

interface InvoicePreviewProps {
  type: 'SALE' | 'PURCHASE';
  data: any;
  user: UserProfile | null;
  branch: Branch | null;
  entity: Supplier | Customer | undefined;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ type, data, user, branch, entity }) => {
  if (!data) return null;

  const docPrefix = type === 'SALE' ? 'INV' : 'PUR';
  const label = type === 'SALE' ? 'Billed To' : 'Procured From';
  const accentColor = type === 'SALE' ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 bg-indigo-50';

  return (
    <div 
      id="invoice-print-area" 
      className="w-full max-w-[800px] bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden p-10 md:p-14 space-y-12 min-h-[1056px] flex flex-col transition-all"
    >
      {/* Professional Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-600 tracking-tighter leading-none">FabricOS</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Management Systems — SparkPair</p>
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center gap-2 text-slate-800 font-black text-base">
              <Building2 className="w-4 h-4 text-indigo-500" /> {user?.shopName}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <MapPin className="w-3 h-3" /> {branch?.name} — {branch?.address}
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
            <p className="font-black text-slate-900 text-lg font-mono tracking-tight">{docPrefix}-{data.id.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Billing Info Grid */}
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-4">
          <p className={`text-[9px] font-black uppercase tracking-widest inline-block px-3 py-1 rounded-full ${accentColor}`}>{label}</p>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">{data.entityName}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
              <Phone className="w-3 h-3 text-indigo-400" /> {entity?.phone || 'N/A'}
            </div>
          </div>
        </div>
        <div className="space-y-4 text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
          <div className="flex items-center justify-end gap-2 text-slate-800 font-black text-base">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
            <span className={`inline-block text-[10px] font-black uppercase tracking-widest ${data.amount === data.paidAmount ? 'text-emerald-500' : 'text-amber-500'}`}>
              {data.amount === data.paidAmount ? 'Settled' : 'Balance Pending'}
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
              {data.items?.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800">{item.articleName}</div>
                    <div className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase">Batch #{data.id.slice(-4)}-{i+1}</div>
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
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes</p>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm font-medium">
              This document is an official record generated via FabricOS. 
              {type === 'SALE' ? ' Thank you for your business!' : ' Stock updated successfully in inventory.'}
            </p>
          </div>
          <div className="flex gap-12 pt-8">
             <div className="w-40 space-y-3 border-t border-slate-200 pt-3 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Prepared By</p>
                <p className="text-[10px] font-bold text-slate-800 truncate">{user?.ownerName}</p>
             </div>
             <div className="w-40 space-y-3 border-t border-slate-200 pt-3 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Sign</p>
                <Signature className="w-4 h-4 text-slate-50 mx-auto" />
             </div>
          </div>
        </div>

        <div className="w-full md:w-72 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-2">
            <span>Subtotal</span>
            <span>${data.amount.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-100 my-1"></div>
          <div className={`flex justify-between items-center p-4 rounded-2xl shadow-lg ${type === 'SALE' ? 'bg-indigo-600' : 'bg-slate-900'} text-white`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Final Total</span>
            <span className="text-2xl font-black tracking-tighter">${data.amount.toLocaleString()}</span>
          </div>
          <p className="text-[9px] text-center text-slate-300 font-bold italic pt-1 tracking-tight">FabricOS Enterprise Terminal</p>
        </div>
      </div>
    </div>
  );
};
