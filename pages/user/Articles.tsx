
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { Plus, X, Package, Ruler, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Article } from '../../types';
import { Combobox } from '../../components/Combobox';

const Articles: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'Meter' });

  const unitOptions = [
    { id: 'Meter', label: 'Meter' },
    { id: 'Yard', label: 'Yard' },
    { id: 'Piece', label: 'Piece' },
    { id: 'Thaan', label: 'Thaan' },
  ];

  useEffect(() => {
    if (user) setArticles(db.articles.getByTenant(user.id));
  }, [user]);

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newArt: Article = {
      id: 'art_' + Date.now(),
      tenantId: user.id,
      name: formData.name,
      unit: formData.unit,
      stock: 0,
      basePrice: 0 
    };

    db.articles.save(newArt);
    setArticles([...articles, newArt]);
    setIsModalOpen(false);
    setFormData({ name: '', unit: 'Meter' });
    toast.success('Fabric article added to inventory!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Fabric Catalog</h2>
          <p className="text-slate-500 mt-1 font-medium">Detailed inventory of your textiles and stock health.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 h-14 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Package className="w-10 h-10" />
             </div>
             <p className="text-slate-400 font-bold italic text-lg">No articles found.</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-4 text-indigo-600 font-black hover:underline inline-flex items-center gap-2">
               Create your first fabric <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        ) : articles.map((art, i) => {
          const isLowStock = art.stock < 20;
          const isOut = art.stock <= 0;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              key={art.id} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              {isLowStock && (
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${isOut ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'}`}>
                  {isOut ? 'Out of Stock' : 'Low Stock'}
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {art.name.charAt(0)}
                </div>
              </div>

              <h4 className="font-black text-slate-800 text-xl mb-1 truncate">{art.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">Unit: {art.unit}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Inventory Level</span>
                  <span className={`text-xl font-black ${isOut ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {art.stock} <span className="text-sm font-bold opacity-60 uppercase">{art.unit}s</span>
                  </span>
                </div>
                {/* Stock Gauge UX */}
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((art.stock / 100) * 100, 100)}%` }}
                    className={`h-full rounded-full ${isOut ? 'bg-rose-500' : isLowStock ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">New Article</h3>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.15em] mt-1">Inventory Management</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleCreateArticle} className="p-10 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Name</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      type="text" 
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold" 
                      placeholder="e.g. Premium Egyptian Cotton" 
                    />
                  </div>
                </div>

                <Combobox 
                  label="Stocking Unit"
                  placeholder="Select unit..."
                  options={unitOptions}
                  value={formData.unit}
                  onChange={(id) => setFormData({...formData, unit: id})}
                  icon={<Ruler className="w-4 h-4" />}
                />
                
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Newly added fabrics start with <strong>Zero stock</strong>. You must log a <strong className="text-slate-800">Purchase</strong> to populate inventory levels.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                  <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Create Fabric</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Articles;
