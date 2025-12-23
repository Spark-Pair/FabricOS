
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { db } from '../../lib/db';
import toast from 'react-hot-toast';
import { Lock, User, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const foundUser = db.users.findByUsername(username);
    
    if (foundUser && foundUser.password === password) {
      const { password: _, ...profile } = foundUser;
      login('mock-jwt', profile as any);
      toast.success(`Welcome back, ${profile.ownerName}`);
      navigate(profile.role === UserRole.ADMIN ? '/admin' : '/dashboard');
    } else {
      toast.error('Invalid credentials. Hint: use admin/admin or aqeel/1234');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left: Branding & Info */}
        <div className="bg-indigo-600 p-12 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-6xl font-black tracking-tighter">FabricOS</h1>
              <div className="w-4 h-4 rounded-full bg-white animate-ping mt-4" />
            </div>
            <div className="flex items-center gap-2 text-indigo-100 mb-4 opacity-90">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <p className="text-xl font-medium tracking-tight">Powered by SparkPair</p>
            </div>
            <p className="text-lg text-indigo-100 font-medium max-w-xs leading-relaxed opacity-70">
              The high-performance textile operating system for modern retail empires.
            </p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-indigo-300" />
              </div>
              <p className="text-sm font-bold tracking-wide">Enterprise Multi-Branch Sync</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-indigo-300" />
              </div>
              <p className="text-sm font-bold tracking-wide">Real-time Margin Protection</p>
            </div>
          </div>
          
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Right: Login Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <header className="mb-12">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Sign In</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Secure Access Terminal — FabricOS v2.0</p>
          </header>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="e.g. aqeel"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 mt-4"
            >
              Enter Workspace
            </button>
            
            <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black text-center mb-4">Internal Access Credentials</p>
              <div className="flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={() => { setUsername('admin'); setPassword('admin'); }}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-200 transition-colors"
                >
                  Admin: admin / admin
                </button>
                <button 
                  type="button" 
                  onClick={() => { setUsername('aqeel'); setPassword('1234'); }}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-200 transition-colors"
                >
                  Shop: aqeel / 1234
                </button>
              </div>
            </div>
          </form>
          <div className="mt-auto pt-10 text-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">
              FabricOS Enterprise Edition — &copy; 2025 SparkPair Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
