
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, TenantState, Subscription } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../lib/db';
import toast from 'react-hot-toast';

interface TenantContextType extends TenantState {
  selectBranch: (branch: Branch) => void;
  refreshTenantData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'ACTIVE' | 'EXPIRED' | 'TRIAL'>('ACTIVE');
  const [daysRemaining, setDaysRemaining] = useState(0);

  const calculateSubscription = (sub?: Subscription) => {
    if (!sub) return;
    const end = new Date(sub.endDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(diff);
    setIsReadOnly(diff < 0);
    setSubscriptionStatus(diff < 0 ? 'EXPIRED' : sub.type === 'DEMO' ? 'TRIAL' : 'ACTIVE');
  };

  const refreshTenantData = async () => {
    if (!user || user.role === 'ADMIN') return;
    
    const tenantBranches = db.branches.getByTenant(user.id);
    setBranches(tenantBranches);
    
    const active = tenantBranches.find(b => b.isDefault) || tenantBranches[0];
    setSelectedBranch(active);
    
    if (user.currentSubscription) {
      calculateSubscription(user.currentSubscription);
    }
  };

  useEffect(() => {
    refreshTenantData();
  }, [user]);

  const selectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    toast.success(`Switched to ${branch.name}`);
  };

  return (
    <TenantContext.Provider value={{ 
      branches, 
      selectedBranch, 
      selectBranch, 
      isReadOnly, 
      subscriptionStatus, 
      daysRemaining,
      refreshTenantData 
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
};
