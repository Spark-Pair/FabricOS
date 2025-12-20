
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
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
  Package
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { branches, selectedBranch, selectBranch } = useTenant();

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

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col fixed left-0 top-0">
      <div className="p-8">
        <h1 className="text-3xl font-black text-indigo-600 tracking-tighter">FabricFlow</h1>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
          {user?.shopName || 'Admin Panel'}
        </p>
      </div>

      {user?.role === UserRole.USER && (
        <div className="px-6 mb-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Active Branch</label>
          <select
            value={selectedBranch?.id || ''}
            onChange={(e) => {
              const b = branches.find(br => br.id === e.target.value);
              if (b) selectBranch(b);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 px-4 overflow-y-auto space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {/* Wrap children in a function to correctly access the isActive property from NavLink */}
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl text-sm font-bold transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
