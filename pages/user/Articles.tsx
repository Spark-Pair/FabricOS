
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';
import { Plus, X, Package, Ruler, DollarSign, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Article } from '../../types';

const Articles: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'Meter', basePrice: '' });

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
      basePrice: parseFloat(formData.basePrice) || 0
    };

    db.articles.save(newArt);
    setArticles([...articles, newArt]);
    setIsModalOpen(false);
    setFormData({ name: '', unit: 'Meter', basePrice: '' });
    toast.success('Fabric article added to inventory!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fabric Articles</h2>
          <p className="text-slate-500 text-sm">Manage your catalog of fabrics and current stock levels.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
          <Plus className="w-5 h-5" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
             <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-medium">No articles found. Add your first fabric to start selling.</p>
          </div>
        ) : articles.map(art => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={art.id} className="bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {art.name.charAt(0)}
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${art.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {art.stock} {art.unit}s
              </div>
            </div>
            <h4 className="font-bold text-slate-800 text-lg">{art.name}</h4>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Base Price</span>
              <span className="font-black text-slate-900">${art.basePrice} <small className="text-[10px] text-slate-400">/{art.unit}</small></span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-black text-slate-800">New Article</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleCreateArticle} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Article Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Premium Egyptian Cotton" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Unit</label>
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                      <option>Meter</option>
                      <option>Yard</option>
                      <option>Piece</option>
                      <option>Thaan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Base Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} type="number" className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Newly created articles will start with <strong>0 stock</strong>. You can add stock via the <strong>Purchases</strong> module.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Save Article</button>
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
