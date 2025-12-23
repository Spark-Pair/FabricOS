
import { UserProfile, Branch, Transaction, Customer, Supplier, UserRole, Article, StockBatch, StockStage, PaymentStatus } from '../types';

const KEYS = {
  USERS: 'ff_users',
  BRANCHES: 'ff_branches',
  TRANSACTIONS: 'ff_transactions',
  CUSTOMERS: 'ff_customers',
  SUPPLIERS: 'ff_suppliers',
  ARTICLES: 'ff_articles',
  BATCHES: 'ff_batches'
};

const initDB = () => {
  if (localStorage.getItem(KEYS.USERS)) return;

  const admin: UserProfile = {
    id: 'admin', username: 'admin', password: 'admin',
    shopName: 'System Admin', ownerName: 'Administrator', phoneNumber: '000',
    role: UserRole.ADMIN, isActive: true, registrationDate: new Date().toISOString(),
  };

  const aqeelId = 'u_aqeel';
  const branchId = 'b_aqeel_1';

  const aqeel: UserProfile = {
    id: aqeelId, username: 'aqeel', password: '1234',
    shopName: 'Elite Fabrics Karachi', ownerName: 'Aqeel Ahmad', phoneNumber: '0300-1234567',
    role: UserRole.USER, isActive: true, registrationDate: new Date().toISOString(),
    currentSubscription: {
      id: 'sub_aqeel', startDate: new Date().toISOString(), 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 50, isPaid: true, type: 'PREMIUM'
    }
  };

  localStorage.setItem(KEYS.USERS, JSON.stringify([admin, aqeel]));
  
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify([
    { id: branchId, tenantId: aqeelId, name: 'Main Outlet', isDefault: true, address: 'Textile Market, Karachi' },
    { id: 'b_aqeel_2', tenantId: aqeelId, name: 'Tariq Road Branch', isDefault: false, address: 'Tariq Road, Karachi' }
  ]));

  localStorage.setItem(KEYS.ARTICLES, JSON.stringify([
    { id: 'art_1', tenantId: aqeelId, name: 'Premium Raw Silk', unit: 'meter' },
    { id: 'art_2', tenantId: aqeelId, name: 'Cotton Lawn (90/70)', unit: 'meter' },
    { id: 'art_3', tenantId: aqeelId, name: 'Digital Print Satin', unit: 'yard' }
  ]));

  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify([
    { id: 's1', tenantId: aqeelId, name: 'Pak Silk Mills', phone: '021-3334445', balance: 125000 },
    { id: 's2', tenantId: aqeelId, name: 'Gul Ahmed Wholesale', phone: '021-9998887', balance: 45000 },
    { id: 's3', tenantId: aqeelId, name: 'Nishat Emporium', phone: '042-7776665', balance: 0 }
  ]));

  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([
    { id: 'c1', tenantId: aqeelId, name: 'Sara Boutique', phone: '0321-1234567', balance: 85000 },
    { id: 'c2', tenantId: aqeelId, name: 'Hassan Retailers', phone: '0333-8889990', balance: 12000 },
    { id: 'c3', tenantId: aqeelId, name: 'Walk-in Client', phone: '0300-0000000', balance: 0 }
  ]));

  localStorage.setItem(KEYS.BATCHES, JSON.stringify([]));

  // Seed some initial payment/recovery history
  const demoTransactions: Transaction[] = [
    {
      id: 'pay_demo_1',
      tenantId: aqeelId,
      branchId: branchId,
      type: 'PAYMENT',
      entityId: 's1',
      entityName: 'Pak Silk Mills',
      amount: 25000,
      paidAmount: 25000,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMode: 'CHEQUE',
      referenceNo: 'CHQ-990011',
      isCleared: true,
      clearedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec_demo_1',
      tenantId: aqeelId,
      branchId: branchId,
      type: 'RECOVERY',
      entityId: 'c1',
      entityName: 'Sara Boutique',
      amount: 15000,
      paidAmount: 15000,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMode: 'CASH',
      referenceNo: 'CSH-001',
      isCleared: true,
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(demoTransactions));
};

initDB();

export const db = {
  users: {
    getAll: (): UserProfile[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
    save: (user: UserProfile) => {
      const users = db.users.getAll();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx > -1) users[idx] = user; else users.push(user);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },
    findByUsername: (username: string) => db.users.getAll().find(u => u.username === username),
  },

  articles: {
    getByTenant: (tenantId: string): Article[] => 
      JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]').filter((a: Article) => a.tenantId === tenantId),
    save: (article: Article) => {
      const all = JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]');
      const idx = all.findIndex((a: any) => a.id === article.id);
      if (idx > -1) all[idx] = article; else all.push(article);
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(all));
    }
  },

  batches: {
    getByTenant: (tenantId: string): StockBatch[] => 
      JSON.parse(localStorage.getItem(KEYS.BATCHES) || '[]').filter((b: StockBatch) => b.tenantId === tenantId),
    save: (batch: StockBatch) => {
      const all = JSON.parse(localStorage.getItem(KEYS.BATCHES) || '[]');
      const idx = all.findIndex((b: any) => b.id === batch.id);
      if (idx > -1) all[idx] = batch; else all.push(batch);
      localStorage.setItem(KEYS.BATCHES, JSON.stringify(all));
    },
    updateQuantity: (batchId: string, delta: number) => {
      const all = JSON.parse(localStorage.getItem(KEYS.BATCHES) || '[]');
      const idx = all.findIndex((b: any) => b.id === batchId);
      if (idx > -1) {
        all[idx].currentQuantity += delta;
        localStorage.setItem(KEYS.BATCHES, JSON.stringify(all));
      }
    }
  },

  transactions: {
    getAllTenant: (tenantId: string): Transaction[] => 
      JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]').filter((t: Transaction) => t.tenantId === tenantId),
    
    getByBranch: (tenantId: string, branchId: string): Transaction[] =>
      db.transactions.getAllTenant(tenantId).filter((t: Transaction) => t.branchId === branchId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    
    save: (t: Transaction) => {
      const all = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
      all.push(t);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));

      // Balance Rule: Immediate Update
      if (t.entityId) {
        if (t.type === 'SALE' || t.type === 'RECOVERY') {
          const cust = db.customers.getByTenant(t.tenantId).find(c => c.id === t.entityId);
          if (cust) {
            cust.balance += (t.type === 'SALE' ? (t.amount - t.paidAmount) : -t.amount);
            db.customers.save(cust);
          }
        } else if (t.type === 'PURCHASE' || t.type === 'WORK' || t.type === 'PAYMENT') {
          const sup = db.suppliers.getByTenant(t.tenantId).find(s => s.id === t.entityId);
          if (sup) {
            sup.balance += (t.type === 'PAYMENT' ? -t.amount : (t.amount - t.paidAmount));
            db.suppliers.save(sup);
          }
        }
      }
    },

    toggleClearance: (transactionId: string, isCleared: boolean, clearanceNote?: string) => {
      const all = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
      const idx = all.findIndex((t: any) => t.id === transactionId);
      if (idx > -1) {
        all[idx].isCleared = isCleared;
        all[idx].clearedAt = isCleared ? new Date().toISOString() : undefined;
        all[idx].clearanceNote = clearanceNote;
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
      }
    }
  },

  customers: {
    getByTenant: (tenantId: string): Customer[] =>
      JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]').filter((c: Customer) => c.tenantId === tenantId),
    save: (c: Customer) => {
      const all = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]');
      const idx = all.findIndex((item: any) => item.id === c.id);
      if (idx > -1) all[idx] = c; else all.push(c);
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(all));
    }
  },

  suppliers: {
    getByTenant: (tenantId: string): Supplier[] =>
      JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]').filter((s: Supplier) => s.tenantId === tenantId),
    save: (s: Supplier) => {
      const all = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
      const idx = all.findIndex((item: any) => item.id === s.id);
      if (idx > -1) all[idx] = s; else all.push(s);
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(all));
    }
  },

  branches: {
    getByTenant: (tenantId: string): Branch[] => 
      JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]').filter((b: Branch) => b.tenantId === tenantId),
    save: (branch: Branch) => {
      const all = JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]');
      all.push(branch);
      localStorage.setItem(KEYS.BRANCHES, JSON.stringify(all));
    }
  }
};
