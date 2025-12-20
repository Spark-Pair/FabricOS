
import { UserProfile, Branch, Transaction, Customer, Supplier, UserRole, Article } from '../types';

const KEYS = {
  USERS: 'ff_users',
  BRANCHES: 'ff_branches',
  TRANSACTIONS: 'ff_transactions',
  CUSTOMERS: 'ff_customers',
  SUPPLIERS: 'ff_suppliers',
  ARTICLES: 'ff_articles'
};

const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const admin: UserProfile = {
      id: 'admin',
      username: 'admin',
      password: 'admin',
      shopName: 'System Admin',
      ownerName: 'Administrator',
      phoneNumber: '000',
      role: UserRole.ADMIN,
      isActive: true,
      registrationDate: new Date().toISOString(),
    };

    const defaultUser: UserProfile = {
      id: 'u_aqeel',
      username: 'aqeel',
      password: '1234',
      shopName: 'Aqeel Fabrics',
      ownerName: 'Aqeel Ahmad',
      phoneNumber: '0300-1234567',
      role: UserRole.USER,
      isActive: true,
      registrationDate: new Date().toISOString(),
      currentSubscription: {
        id: 'sub_aqeel',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 0,
        isPaid: true,
        type: 'DEMO'
      }
    };
    localStorage.setItem(KEYS.USERS, JSON.stringify([admin, defaultUser]));

    const branches: Branch[] = [{
      id: 'b_aqeel_1',
      tenantId: 'u_aqeel',
      name: 'Main Outlet',
      isDefault: true,
      address: 'Shop #12, Fabric Market'
    }];
    localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
    
    // Default articles for Aqeel
    const articles: Article[] = [
      { id: 'art_1', tenantId: 'u_aqeel', name: 'Cotton Silk', unit: 'Meter', stock: 100, basePrice: 15 },
      { id: 'art_2', tenantId: 'u_aqeel', name: 'Wash n Wear', unit: 'Meter', stock: 50, basePrice: 10 }
    ];
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
  }
};

initDB();

export const db = {
  users: {
    getAll: (): UserProfile[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
    save: (user: UserProfile) => {
      const users = db.users.getAll();
      const index = users.findIndex(u => u.id === user.id);
      if (index > -1) users[index] = user;
      else users.push(user);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },
    findByUsername: (username: string) => db.users.getAll().find(u => u.username === username),
  },
  branches: {
    getByTenant: (tenantId: string): Branch[] => 
      JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]').filter((b: Branch) => b.tenantId === tenantId),
    save: (branch: Branch) => {
      const all = JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]');
      all.push(branch);
      localStorage.setItem(KEYS.BRANCHES, JSON.stringify(all));
    }
  },
  articles: {
    getByTenant: (tenantId: string): Article[] =>
      JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]').filter((a: Article) => a.tenantId === tenantId),
    save: (article: Article) => {
      const all = JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]');
      const index = all.findIndex((a: any) => a.id === article.id);
      if (index > -1) all[index] = article;
      else all.push(article);
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(all));
    },
    updateStock: (articleId: string, delta: number) => {
      const all = JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]');
      const index = all.findIndex((a: any) => a.id === articleId);
      if (index > -1) {
        all[index].stock += delta;
        localStorage.setItem(KEYS.ARTICLES, JSON.stringify(all));
      }
    }
  },
  transactions: {
    getByBranch: (tenantId: string, branchId: string): Transaction[] =>
      JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]').filter((t: Transaction) => 
        t.tenantId === tenantId && t.branchId === branchId),
    save: (t: Transaction) => {
      const all = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
      all.push(t);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
      
      // Update stock if it's a SALE or PURCHASE with items
      if (t.items) {
        t.items.forEach(item => {
          const delta = t.type === 'PURCHASE' ? item.quantity : -item.quantity;
          db.articles.updateStock(item.articleId, delta);
        });
      }

      // Update entity balances
      if (t.type === 'SALE') {
        const balance = t.amount - t.paidAmount;
        if (t.entityId && balance !== 0) {
          const customers = db.customers.getByTenant(t.tenantId);
          const cust = customers.find(c => c.id === t.entityId);
          if (cust) {
            cust.balance += balance;
            db.customers.save(cust);
          }
        }
      } else if (t.type === 'PURCHASE') {
        const balance = t.amount - t.paidAmount;
        if (t.entityId && balance !== 0) {
          const suppliers = db.suppliers.getByTenant(t.tenantId);
          const sup = suppliers.find(s => s.id === t.entityId);
          if (sup) {
            sup.balance += balance;
            db.suppliers.save(sup);
          }
        }
      }
    },
    getAllTenant: (tenantId: string): Transaction[] => 
      JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]').filter((t: Transaction) => t.tenantId === tenantId)
  },
  customers: {
    getByTenant: (tenantId: string): Customer[] =>
      JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]').filter((c: Customer) => c.tenantId === tenantId),
    save: (c: Customer) => {
      const all = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]');
      const index = all.findIndex((item: any) => item.id === c.id);
      if (index > -1) all[index] = c;
      else all.push(c);
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(all));
    }
  },
  suppliers: {
    getByTenant: (tenantId: string): Supplier[] =>
      JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]').filter((s: Supplier) => s.tenantId === tenantId),
    save: (s: Supplier) => {
      const all = JSON.parse(localStorage.getItem(KEYS.SUPPLIERS) || '[]');
      const index = all.findIndex((item: any) => item.id === s.id);
      if (index > -1) all[index] = s;
      else all.push(s);
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(all));
    }
  }
};
