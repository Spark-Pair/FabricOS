
import React from 'react';
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
  X
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
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

  const branchOptions = branches.map(b => ({
    id: b.id,
    label: b.name,
    sublabel: b.isDefault ? 'Main Office' : 'Branch Store'
  }));

  return (
    <div className="h-full bg-white border-r border-slate-100 flex flex-col w-full">
      <div className="p-8 flex items-center justify-between">
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
        <div className="px-6 mb-6">
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

      <div className="p-6 border-t border-slate-50 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl text-sm font-bold transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
