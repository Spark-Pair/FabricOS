
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  isDefault: boolean;
  address?: string;
}

export interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  isPaid: boolean;
  type: 'DEMO' | 'PREMIUM';
}

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  shopName: string;
  ownerName: string;
  phoneNumber: string;
  cnic?: string;
  role: UserRole;
  isActive: boolean;
  registrationDate: string;
  currentSubscription?: Subscription;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  balance: number;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  balance: number;
}

export interface Article {
  id: string;
  tenantId: string;
  name: string;
  unit: string; // Meter, Yard, Piece, etc.
  stock: number;
  basePrice: number; // Original purchase price per unit
  workCost?: number; // Accumulated processing work cost per unit
}

export interface TransactionItem {
  articleId: string;
  articleName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Transaction {
  id: string;
  tenantId: string;
  branchId: string;
  type: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'WORK' | 'PAYMENT' | 'RECOVERY';
  category?: string;
  entityId?: string; // ID of Customer or Supplier
  entityName: string; 
  amount: number;
  paidAmount: number;
  date: string;
  note?: string;
  items?: TransactionItem[];
  workDescription?: string; // For WORK type
  workPricePerUnit?: number; // For WORK type
}

export interface TenantState {
  selectedBranch: Branch | null;
  branches: Branch[];
  isReadOnly: boolean;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  daysRemaining: number;
}
