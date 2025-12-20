
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { db } from '../../lib/db';
import toast from 'react-hot-toast';
import { Lock, User } from 'lucide-react';

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
      toast.success(`Welcome, ${profile.ownerName}`);
      navigate(profile.role === UserRole.ADMIN ? '/admin' : '/dashboard');
    } else {
      toast.error('Invalid credentials. Hint: use admin/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border p-2">
        <div className="bg-indigo-600 p-8 text-center text-white rounded-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight">FabricFlow</h1>
          <p className="mt-2 text-indigo-100">Intelligent Textile Management</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Username"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            Sign In
          </button>
          
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Demo Access</p>
            <div className="mt-2 flex justify-center gap-4 text-sm text-slate-600">
              <span className="bg-slate-100 px-2 py-1 rounded">Admin: admin/admin</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
