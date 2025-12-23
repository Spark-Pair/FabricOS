
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
  const branch1Id = 'b_aqeel_1';
  const branch2Id = 'b_aqeel_2';

  const aqeel: UserProfile = {
    id: aqeelId, username: 'aqeel', password: '1234',
    shopName: 'Elite Fabrics & Textiles', ownerName: 'Aqeel Ahmad', phoneNumber: '0300-1234567',
    role: UserRole.USER, isActive: true, registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    currentSubscription: {
      id: 'sub_aqeel', startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 150, isPaid: true, type: 'PREMIUM'
    }
  };

  localStorage.setItem(KEYS.USERS, JSON.stringify([admin, aqeel]));
  
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify([
    { id: branch1Id, tenantId: aqeelId, name: 'Karachi Main Outlet', isDefault: true, address: 'Zama-Zama Market, Phase 5, DHA, Karachi' },
    { id: branch2Id, tenantId: aqeelId, name: 'Lahore Boutique Wing', isDefault: false, address: 'Gulberg 3, Main Boulevard, Lahore' }
  ]));

  const articles: Article[] = [
    { id: 'art_1', tenantId: aqeelId, name: 'Premium Raw Silk (9000)', unit: 'meter' },
    { id: 'art_2', tenantId: aqeelId, name: 'Cotton Lawn (90/70)', unit: 'meter' },
    { id: 'art_3', tenantId: aqeelId, name: 'Digital Print Voile', unit: 'meter' },
    { id: 'art_4', tenantId: aqeelId, name: 'Embroidered Organza', unit: 'yard' },
    { id: 'art_5', tenantId: aqeelId, name: 'Plain Chiffon', unit: 'yard' }
  ];
  localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));

  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify([
    { id: 's1', tenantId: aqeelId, name: 'Indus Weaving Co.', phone: '021-3334445', balance: 85000 },
    { id: 's2', tenantId: aqeelId, name: 'Master Printing Studios', phone: '042-9998887', balance: 12400 },
    { id: 's3', tenantId: aqeelId, name: 'Zari Embroidery Hub', phone: '021-7776665', balance: 4500 },
    { id: 's4', tenantId: aqeelId, name: 'Rainbow Dyeing Lab', phone: '021-5554433', balance: 0 }
  ]));

  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([
    { id: 'c1', tenantId: aqeelId, name: 'Zara Boutique House', phone: '0321-1234567', balance: 145000 },
    { id: 'c2', tenantId: aqeelId, name: 'Modern Stitch Retailers', phone: '0333-8889990', balance: 42000 },
    { id: 'c3', tenantId: aqeelId, name: 'Urban Ethnic Wear', phone: '0300-5554443', balance: 0 },
    { id: 'c4', tenantId: aqeelId, name: 'Walk-in Client (Cash)', phone: '0000-0000000', balance: 0 }
  ]));

  // Strict Batch Genealogy
  const initialBatches: StockBatch[] = [
    {
      id: 'batch_seed_01', tenantId: aqeelId, branchId: branch1Id, articleId: 'art_1', articleName: 'Premium Raw Silk (9000)',
      stage: 'RAW', initialQuantity: 5000, currentQuantity: 1200, unit: 'meter',
      unitCost: 12, basePurchasePrice: 12, accumulatedWorkCost: 0,
      supplierId: 's1', supplierName: 'Indus Weaving Co.', date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'batch_seed_02', tenantId: aqeelId, branchId: branch1Id, articleId: 'art_1', articleName: 'Premium Raw Silk (9000)',
      stage: 'PRINTED', initialQuantity: 500, currentQuantity: 340, unit: 'meter',
      unitCost: 18, basePurchasePrice: 12, accumulatedWorkCost: 6,
      supplierId: 's2', supplierName: 'Master Printing Studios', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      parentId: 'batch_seed_01'
    },
    {
      id: 'batch_seed_03', tenantId: aqeelId, branchId: branch2Id, articleId: 'art_4', articleName: 'Embroidered Organza',
      stage: 'FINISHED', initialQuantity: 200, currentQuantity: 185, unit: 'yard',
      unitCost: 45, basePurchasePrice: 20, accumulatedWorkCost: 25,
      supplierId: 's3', supplierName: 'Zari Embroidery Hub', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(initialBatches));

  // Extensive Transaction History
  const demoTransactions: Transaction[] = [];
  const baseDate = Date.now();

  // Generated ~25 varied transactions
  for (let i = 0; i < 25; i++) {
    const dayOffset = Math.floor(Math.random() * 60);
    const date = new Date(baseDate - dayOffset * 24 * 60 * 60 * 1000).toISOString();
    const typeRoll = Math.random();
    
    let t: Partial<Transaction> = {
      id: `txn_seed_${i}`,
      tenantId: aqeelId,
      branchId: i % 4 === 0 ? branch2Id : branch1Id,
      date: date,
      createdAt: date
    };

    if (typeRoll < 0.4) { // SALE (40% weight)
      const amount = Math.floor(Math.random() * 25000) + 5000;
      const isSettled = Math.random() > 0.5;
      const cust = i % 2 === 0 ? 'c1' : 'c2';
      t = { ...t, type: 'SALE', entityId: cust, entityName: cust === 'c1' ? 'Zara Boutique House' : 'Modern Stitch Retailers',
            amount: amount, paidAmount: isSettled ? amount : Math.floor(amount * 0.3),
            items: [{ articleId: 'art_1', articleName: 'Premium Raw Silk', batchId: 'batch_seed_01', quantity: 10, unit: 'meter', price: amount / 10, unitCost: 12 }] };
    } else if (typeRoll < 0.6) { // PURCHASE (20% weight)
      const amount = Math.floor(Math.random() * 50000) + 10000;
      t = { ...t, type: 'PURCHASE', entityId: 's1', entityName: 'Indus Weaving Co.', amount: amount, paidAmount: 0,
            items: [{ articleId: 'art_2', articleName: 'Cotton Lawn (90/70)', batchId: '', quantity: 100, unit: 'meter', price: amount / 100, unitCost: amount / 100 }] };
    } else if (typeRoll < 0.75) { // EXPENSE (15% weight)
      const cat = ['Rent', 'Salaries', 'Electricity', 'Misc'][Math.floor(Math.random() * 4)];
      t = { ...t, type: 'EXPENSE', category: cat, entityName: 'Commercial Operations', amount: Math.floor(Math.random() * 5000) + 500, paidAmount: 0 };
    } else if (typeRoll < 0.85) { // PAYMENT (10% weight)
      const amount = Math.floor(Math.random() * 10000) + 2000;
      t = { ...t, type: 'PAYMENT', entityId: 's1', entityName: 'Indus Weaving Co.', amount: amount, paidAmount: amount,
            paymentMode: 'CHEQUE', referenceNo: `CHQ-${Math.floor(Math.random() * 99999)}`, bankName: 'HBL Karachi', isCleared: Math.random() > 0.3 };
    } else { // RECOVERY (15% weight)
      const amount = Math.floor(Math.random() * 15000) + 5000;
      t = { ...t, type: 'RECOVERY', entityId: 'c1', entityName: 'Zara Boutique House', amount: amount, paidAmount: amount,
            paymentMode: 'CASH', referenceNo: `CSH-${Math.floor(Math.random() * 999)}`, isCleared: true };
    }
    demoTransactions.push(t as Transaction);
  }

  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(demoTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
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
    getAll: (): StockBatch[] => JSON.parse(localStorage.getItem(KEYS.BATCHES) || '[]'),
    getByTenant: (tenantId: string): StockBatch[] => 
      db.batches.getAll().filter((b: StockBatch) => b.tenantId === tenantId),
    save: (batch: StockBatch) => {
      const all = db.batches.getAll();
      const idx = all.findIndex((b: any) => b.id === batch.id);
      if (idx > -1) all[idx] = batch; else all.push(batch);
      localStorage.setItem(KEYS.BATCHES, JSON.stringify(all));
    },
    updateQuantity: (batchId: string, delta: number) => {
      const all = db.batches.getAll();
      const idx = all.findIndex((b: any) => b.id === batchId);
      if (idx > -1) {
        if (all[idx].currentQuantity + delta < 0) throw new Error("Insufficient batch quantity!");
        all[idx].currentQuantity += delta;
        localStorage.setItem(KEYS.BATCHES, JSON.stringify(all));
      } else {
        throw new Error("Batch not found during quantity update.");
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
      
      // Strict Batch Logic
      if (t.type === 'PURCHASE' && t.items) {
        t.items.forEach(item => {
          const newBatch: StockBatch = {
            id: 'batch_' + Math.random().toString(36).substr(2, 9),
            tenantId: t.tenantId, branchId: t.branchId, articleId: item.articleId, articleName: item.articleName,
            stage: 'RAW', initialQuantity: item.quantity, currentQuantity: item.quantity,
            unit: item.unit, unitCost: item.price, basePurchasePrice: item.price, accumulatedWorkCost: 0,
            supplierId: t.entityId || '', supplierName: t.entityName, date: t.date
          };
          db.batches.save(newBatch);
          item.batchId = newBatch.id;
        });
      }

      if (t.type === 'SALE' && t.items) {
        t.items.forEach(item => {
          if (!item.batchId) throw new Error(`Sale item ${item.articleName} has no batch assigned.`);
          db.batches.updateQuantity(item.batchId, -item.quantity);
          const batch = db.batches.getAll().find(b => b.id === item.batchId);
          if (batch) item.unitCost = batch.unitCost;
        });
      }

      if (t.type === 'WORK' && t.sourceBatchId && t.items?.[0]) {
        const item = t.items[0];
        const sourceBatch = db.batches.getAll().find(b => b.id === t.sourceBatchId);
        if (!sourceBatch) throw new Error("Source batch not found.");
        db.batches.updateQuantity(t.sourceBatchId, -item.quantity);
        const targetBatch: StockBatch = {
          id: 'batch_trans_' + Date.now(), tenantId: t.tenantId, branchId: t.branchId,
          articleId: sourceBatch.articleId, articleName: sourceBatch.articleName,
          stage: (t.category as StockStage) || 'PRINTED', initialQuantity: item.quantity, currentQuantity: item.quantity,
          unit: sourceBatch.unit, unitCost: sourceBatch.unitCost + (t.workPricePerUnit || 0),
          basePurchasePrice: sourceBatch.basePurchasePrice,
          accumulatedWorkCost: sourceBatch.accumulatedWorkCost + (t.workPricePerUnit || 0),
          supplierId: t.entityId || '', supplierName: t.entityName, date: t.date, parentId: sourceBatch.id
        };
        db.batches.save(targetBatch);
        item.batchId = targetBatch.id;
      }

      all.push(t);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));

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
