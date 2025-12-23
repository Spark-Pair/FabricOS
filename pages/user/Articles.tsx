
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { Plus, Package, Ruler, Info, ArrowRight, Layers, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Article, StockBatch } from '../../types';
import { Combobox } from '../../components/Combobox';
import { Modal } from '../../components/Modal';

const Articles: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'Meter' });
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const unitOptions = [
    { id: 'Meter', label: 'Meter' },
    { id: 'Yard', label: 'Yard' },
    { id: 'Piece', label: 'Piece' },
    { id: 'Thaan', label: 'Thaan' },
  ];

  useEffect(() => {
    if (user) {
      setArticles(db.articles.getByTenant(user.id));
      setBatches(db.batches.getByTenant(user.id));
    }
  }, [user]);

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newArt: Article = { id: 'art_' + Date.now(), tenantId: user.id, name: formData.name, unit: formData.unit };
    db.articles.save(newArt);
    setArticles([...articles, newArt]);
    setIsModalOpen(false);
    setFormData({ name: '', unit: 'Meter' });
    toast.success('New fabric identity created!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full overflow-y-auto pb-20 custom-scrollbar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Fabric Catalog</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage base identities and batch-level transformations.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 h-14 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Create New Article
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {articles.length === 0 ? (
          <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
             <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold italic text-lg">No articles found.</p>
          </div>
        ) : articles.map((art, i) => {
          const artBatches = batches.filter(b => b.articleId === art.id && b.currentQuantity > 0);
          const totalStock = artBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
          const isExpanded = expandedArticle === art.id;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={art.id} 
              className={`bg-white rounded-[2.5rem] border transition-all ${isExpanded ? 'border-indigo-200 shadow-xl' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
            >
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => setExpandedArticle(isExpanded ? null : art.id)}>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner">
                    {art.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-2xl mb-1">{art.name}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Base Unit: {art.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Live Inventory</p>
                      <p className="text-2xl font-black text-slate-800 tracking-tight">{totalStock.toLocaleString()} <span className="text-xs font-bold opacity-40">{art.unit}s</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Batches</p>
                      <p className="text-2xl font-black text-indigo-600 tracking-tight">{artBatches.length}</p>
                   </div>
                   <div className={`p-3 rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                      <Layers className="w-5 h-5" />
                   </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50/50 border-t border-slate-50 px-8 pb-8 pt-4 rounded-b-[2.5rem]"
                  >
                    <div className="space-y-4 mt-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Traceability Table</p>
                      {artBatches.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium italic text-sm">No physical stock available for this article. Record a purchase to add stock.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {artBatches.map(batch => (
                            <div key={batch.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:border-indigo-300 transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                  batch.stage === 'RAW' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  Stage: {batch.stage}
                                </span>
                                <div className="text-right">
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Unit Cost</div>
                                  <div className="text-lg font-black text-slate-900 tracking-tight">${batch.unitCost.toLocaleString()}</div>
                                </div>
                              </div>
                              
                              <div className="space-y-1 mb-4">
                                <p className="text-xs font-bold text-slate-700 truncate">Vendor: {batch.supplierName}</p>
                                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-black uppercase">
                                  <Calendar className="w-3 h-3" /> {new Date(batch.date).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex items-end justify-between pt-3 border-t border-slate-50">
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                                  <p className="text-lg font-black text-indigo-600">{batch.currentQuantity} <span className="text-[10px]">{batch.unit}</span></p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Fabric Article" icon={<Package className="w-6 h-6" />} maxWidth="max-w-md">
        <form onSubmit={handleCreateArticle} className="p-10 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold" placeholder="e.g. Latif Raw Silk" />
          </div>
          <Combobox label="Base Unit" options={unitOptions} value={formData.unit} onChange={(id) => setFormData({...formData, unit: id})} icon={<Ruler className="w-4 h-4" />} />
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Create Identity</button>
        </form>
      </Modal>
    </div>
  );
};

export default Articles;
