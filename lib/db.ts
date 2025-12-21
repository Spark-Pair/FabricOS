
import { UserProfile, Branch, Transaction, Customer, Supplier, UserRole, Article, TransactionItem } from '../types';

const KEYS = {
  USERS: 'ff_users',
  BRANCHES: 'ff_branches',
  TRANSACTIONS: 'ff_transactions',
  CUSTOMERS: 'ff_customers',
  SUPPLIERS: 'ff_suppliers',
  ARTICLES: 'ff_articles'
};

const initDB = () => {
  // Clear and re-initialize for a full "mocked" experience if needed, 
  // or just check if users exist. Here we check for users to avoid constant reset.
  if (localStorage.getItem(KEYS.USERS)) return;

  const admin: UserProfile = {
    id: 'admin',
    username: 'admin',
    password: 'admin',
    shopName: 'System Admin',
    ownerName: 'Administrator',
    phoneNumber: '000',
    role: UserRole.ADMIN,
    isActive: true,
    registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const aqeel: UserProfile = {
    id: 'u_aqeel',
    username: 'aqeel',
    password: '1234',
    shopName: 'Aqeel Fabrics',
    ownerName: 'Aqeel Ahmad',
    phoneNumber: '0300-1234567',
    role: UserRole.USER,
    isActive: true,
    registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    currentSubscription: {
      id: 'sub_aqeel',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 50,
      isPaid: true,
      type: 'PREMIUM'
    }
  };

  const zainab: UserProfile = {
    id: 'u_zainab',
    username: 'zainab',
    password: 'password',
    shopName: 'Zainab Boutique & Silks',
    ownerName: 'Zainab Fatima',
    phoneNumber: '0321-7654321',
    role: UserRole.USER,
    isActive: true,
    registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    currentSubscription: {
      id: 'sub_zainab',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 0,
      isPaid: true,
      type: 'DEMO'
    }
  };

  localStorage.setItem(KEYS.USERS, JSON.stringify([admin, aqeel, zainab]));

  // Mock Branches
  const branches: Branch[] = [
    { id: 'b_aqeel_1', tenantId: 'u_aqeel', name: 'Liberty Market Outlet', isDefault: true, address: 'Liberty Plaza, Lahore' },
    { id: 'b_aqeel_2', tenantId: 'u_aqeel', name: 'MM Alam Branch', isDefault: false, address: 'MM Alam Road, Gulberg' },
    { id: 'b_zainab_1', tenantId: 'u_zainab', name: 'Main Boutique', isDefault: true, address: 'DHA Phase 5, Karachi' }
  ];
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));

  // Mock Customers
  const customers: Customer[] = [
    { id: 'c1', tenantId: 'u_aqeel', name: 'Mrs. Saima Khan', phone: '0300-9988776', balance: 1200 },
    { id: 'c2', tenantId: 'u_aqeel', name: 'Haji Bashir Ahmad', phone: '0345-1122334', balance: 4500 },
    { id: 'c3', tenantId: 'u_aqeel', name: 'Elegance Boutique', phone: '0312-5554443', balance: -500 },
    { id: 'c4', tenantId: 'u_zainab', name: 'Sarah Ahmed', phone: '0333-1234567', balance: 0 }
  ];
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));

  // Mock Suppliers
  const suppliers: Supplier[] = [
    { id: 's1', tenantId: 'u_aqeel', name: 'Faisalabad Textile Mills', phone: '041-8877665', balance: 15000 },
    { id: 's2', tenantId: 'u_aqeel', name: 'Kohinoor Wholesale', phone: '042-1112223', balance: 0 },
    { id: 's3', tenantId: 'u_zainab', name: 'Silk Importers Ltd', phone: '021-4443332', balance: 8000 }
  ];
  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(suppliers));

  // Mock Articles
  const articles: Article[] = [
    { id: 'art_1', tenantId: 'u_aqeel', name: 'Egyptian Cotton (Soft)', unit: 'Meter', stock: 450, basePrice: 12 },
    { id: 'art_2', tenantId: 'u_aqeel', name: 'Premium Karandi', unit: 'Meter', stock: 120, basePrice: 25 },
    { id: 'art_3', tenantId: 'u_aqeel', name: 'Digital Print Lawn', unit: 'Thaan', stock: 15, basePrice: 85 },
    { id: 'art_4', tenantId: 'u_aqeel', name: 'Raw Silk', unit: 'Yard', stock: 85, basePrice: 18 },
    { id: 'art_z1', tenantId: 'u_zainab', name: 'Chiffon Embroidery', unit: 'Piece', stock: 40, basePrice: 150 }
  ];
  localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));

  // Mock Transactions
  const transactions: Transaction[] = [
    // Aqeel - Sales
    {
      id: 't1', tenantId: 'u_aqeel', branchId: 'b_aqeel_1', type: 'SALE', entityId: 'c1', entityName: 'Mrs. Saima Khan',
      amount: 4500, paidAmount: 3300, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      items: [{ articleId: 'art_1', articleName: 'Egyptian Cotton (Soft)', quantity: 15, unit: 'Meter', price: 300 }]
    },
    {
      id: 't2', tenantId: 'u_aqeel', branchId: 'b_aqeel_1', type: 'SALE', entityId: 'c2', entityName: 'Haji Bashir Ahmad',
      amount: 12000, paidAmount: 7500, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: [{ articleId: 'art_3', articleName: 'Digital Print Lawn', quantity: 2, unit: 'Thaan', price: 6000 }]
    },
    // Aqeel - Purchases
    {
      id: 't3', tenantId: 'u_aqeel', branchId: 'b_aqeel_1', type: 'PURCHASE', entityId: 's1', entityName: 'Faisalabad Textile Mills',
      amount: 50000, paidAmount: 35000, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      items: [{ articleId: 'art_1', articleName: 'Egyptian Cotton (Soft)', quantity: 200, unit: 'Meter', price: 250 }]
    },
    // Aqeel - Expenses
    {
      id: 't4', tenantId: 'u_aqeel', branchId: 'b_aqeel_1', type: 'EXPENSE', category: 'Shop Rent',
      entityName: 'January Rent', amount: 25000, paidAmount: 25000, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't5', tenantId: 'u_aqeel', branchId: 'b_aqeel_1', type: 'EXPENSE', category: 'Electricity Bill',
      entityName: 'LESCO Bill Jan', amount: 8400, paidAmount: 8400, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
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
        t.tenantId === tenantId && t.branchId === branchId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
