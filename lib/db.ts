
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

  const aqeel: UserProfile = {
    id: aqeelId, username: 'aqeel', password: '1234',
    shopName: 'Elite Fabrics & Textiles', ownerName: 'Aqeel Ahmad', phoneNumber: '0300-1234567',
    role: UserRole.USER, isActive: true, registrationDate: new Date().toISOString(),
    currentSubscription: {
      id: 'sub_aqeel', startDate: new Date().toISOString(), 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 50, isPaid: true, type: 'PREMIUM'
    }
  };

  localStorage.setItem(KEYS.USERS, JSON.stringify([admin, aqeel]));
  
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify([
    { id: branch1Id, tenantId: aqeelId, name: 'Karachi Main Outlet', isDefault: true, address: 'Zama-Zama Market, Karachi' }
  ]));

  const articles: Article[] = [
    { id: 'art_1', tenantId: aqeelId, name: 'Premium Raw Silk', unit: 'meter' },
    { id: 'art_2', tenantId: aqeelId, name: 'Cotton Lawn (90/70)', unit: 'meter' }
  ];
  localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));

  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify([
    { id: 's1', tenantId: aqeelId, name: 'Indus Weaving Co.', phone: '021-3334445', balance: 0 },
    { id: 's2', tenantId: aqeelId, name: 'Master Printers', phone: '021-9998887', balance: 0 }
  ]));

  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([
    { id: 'c1', tenantId: aqeelId, name: 'Zara Boutique', phone: '0321-1234567', balance: 0 }
  ]));

  // Seed initial batches
  const initialBatches: StockBatch[] = [
    {
      id: 'b_seed_1', tenantId: aqeelId, branchId: branch1Id, articleId: 'art_1', articleName: 'Premium Raw Silk',
      stage: 'RAW', initialQuantity: 1000, currentQuantity: 1000, unit: 'meter',
      unitCost: 10, basePurchasePrice: 10, accumulatedWorkCost: 0,
      supplierId: 's1', supplierName: 'Indus Weaving Co.', date: new Date().toISOString()
    }
  ];
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(initialBatches));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
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
      
      // 1. Handle STOCK IN (Purchases)
      if (t.type === 'PURCHASE' && t.items) {
        t.items.forEach(item => {
          const newBatch: StockBatch = {
            id: 'batch_' + Math.random().toString(36).substr(2, 9),
            tenantId: t.tenantId,
            branchId: t.branchId,
            articleId: item.articleId,
            articleName: item.articleName,
            stage: 'RAW', // Mandatory for purchases
            initialQuantity: item.quantity,
            currentQuantity: item.quantity,
            unit: item.unit,
            unitCost: item.price,
            basePurchasePrice: item.price,
            accumulatedWorkCost: 0,
            supplierId: t.entityId || '',
            supplierName: t.entityName,
            date: t.date
          };
          db.batches.save(newBatch);
          item.batchId = newBatch.id; // Map item to its new batch
        });
      }

      // 2. Handle STOCK OUT (Sales)
      if (t.type === 'SALE' && t.items) {
        t.items.forEach(item => {
          if (!item.batchId) throw new Error(`Sale item ${item.articleName} has no batch assigned.`);
          // Reduce batch qty
          db.batches.updateQuantity(item.batchId, -item.quantity);
          // Snapshot cost from batch for accurate profit
          const batch = db.batches.getAll().find(b => b.id === item.batchId);
          if (batch) item.unitCost = batch.unitCost;
        });
      }

      // 3. Handle STOCK TRANSFORMATION (Work Processing)
      if (t.type === 'WORK' && t.sourceBatchId && t.items?.[0]) {
        const item = t.items[0];
        const sourceBatch = db.batches.getAll().find(b => b.id === t.sourceBatchId);
        if (!sourceBatch) throw new Error("Source batch not found for transformation.");

        // Reduce source qty
        db.batches.updateQuantity(t.sourceBatchId, -item.quantity);

        // Create new TARGET batch
        const targetBatch: StockBatch = {
          id: 'batch_trans_' + Date.now(),
          tenantId: t.tenantId,
          branchId: t.branchId,
          articleId: sourceBatch.articleId,
          articleName: sourceBatch.articleName,
          stage: (t.category as StockStage) || 'PRINTED',
          initialQuantity: item.quantity,
          currentQuantity: item.quantity,
          unit: sourceBatch.unit,
          unitCost: sourceBatch.unitCost + (t.workPricePerUnit || 0), // Cost accumulation
          basePurchasePrice: sourceBatch.basePurchasePrice,
          accumulatedWorkCost: sourceBatch.accumulatedWorkCost + (t.workPricePerUnit || 0),
          supplierId: t.entityId || '',
          supplierName: t.entityName,
          date: t.date,
          parentId: sourceBatch.id
        };
        db.batches.save(targetBatch);
        item.batchId = targetBatch.id;
      }

      all.push(t);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));

      // 4. Handle BALANCES
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
