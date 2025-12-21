
import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Combobox } from './Combobox';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Truck, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  ArrowLeftRight,
  LogOut,
  Settings,
  BarChart3,
  Package,
  MapPin,
  X,
  ChevronUp,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { branches, selectedBranch, selectBranch } = useTenant();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Manage Shops' },
  ];

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/articles', icon: Package, label: 'Fabric Catalog' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/purchases', icon: Truck, label: 'Purchases' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/payables', icon: CreditCard, label: 'Payables' },
    { to: '/receivables', icon: ArrowLeftRight, label: 'Receivables' },
    { to: '/suppliers', icon: Store, label: 'Suppliers' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/branches', icon: Settings, label: 'Branches' },
  ];

  const links = user?.role === UserRole.ADMIN ? adminLinks : userLinks;

  const branchOptions = branches.map(b => ({
    id: b.id,
    label: b.name,
    sublabel: b.isDefault ? 'Main Office' : 'Branch Store'
  }));

  return (
    <div className="h-full bg-white border-r border-slate-100 flex flex-col w-full overflow-hidden">
      <div className="p-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">FabricFlow</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            {user?.shopName || 'Admin Panel'}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-lg lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {user?.role === UserRole.USER && (
        <div className="px-6 mb-6 shrink-0">
          <Combobox 
            label="Active Branch"
            placeholder="Switch branch..."
            options={branchOptions}
            value={selectedBranch?.id || ''}
            onChange={(id) => {
              const b = branches.find(br => br.id === id);
              if (b) selectBranch(b);
              if (onClose) onClose();
            }}
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>
      )}

      <nav className="flex-1 px-4 overflow-y-auto space-y-1 custom-scrollbar pb-8">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50 shrink-0 relative" ref={profileRef}>
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -8, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-6 right-6 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[70] overflow-hidden p-2"
            >
              <button className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Account Security
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                <Settings className="w-4 h-4 text-slate-400" />
                Preferences
              </button>
              <div className="h-px bg-slate-50 my-2 mx-2"></div>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-rose-500 hover:bg-rose-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border-2 ${isProfileOpen ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-transparent hover:bg-slate-50'}`}
        >
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-indigo-100 shrink-0">
            {user?.ownerName.charAt(0)}
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-sm font-black text-slate-800 truncate leading-tight">
              {user?.ownerName}
            </h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">
              {user?.role === UserRole.ADMIN ? 'System Administrator' : `Terminal #${user?.id.slice(-4)}`}
            </p>
          </div>
          <ChevronUp className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-indigo-500' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
