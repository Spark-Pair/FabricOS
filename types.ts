
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export type StockStage = 'RAW' | 'PRINTED' | 'DYED' | 'EMBROIDERED' | 'FINISHED';
export type PaymentMode = 'CASH' | 'ONLINE' | 'CHEQUE' | 'SLIP';
export type PaymentStatus = 'PENDING' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';

export interface StockBatch {
  id: string;
  tenantId: string;
  branchId: string;
  articleId: string;
  articleName: string;
  stage: StockStage;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  unitCost: number;
  basePurchasePrice: number;
  accumulatedWorkCost: number;
  supplierId: string;
  supplierName: string;
  date: string;
  parentId?: string;
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
  unit: string;
}

export interface TransactionItem {
  articleId: string;
  articleName: string;
  batchId: string;
  quantity: number;
  unit: string;
  price: number;
  unitCost: number;
}

export interface Transaction {
  id: string;
  tenantId: string;
  branchId: string;
  type: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'WORK' | 'PAYMENT' | 'RECOVERY';
  category?: string;
  entityId?: string;
  entityName: string; 
  amount: number;
  paidAmount: number;
  date: string;
  note?: string;
  items?: TransactionItem[];
  workDescription?: string;
  workPricePerUnit?: number;
  sourceBatchId?: string;
  targetBatchId?: string;
  paymentMode?: PaymentMode;
  paymentStatus?: PaymentStatus; 
  isCleared?: boolean; 
  referenceNo?: string;
  bankName?: string;
  clearedAt?: string;
  clearanceNote?: string;
  createdAt: string;
}

export interface TenantState {
  selectedBranch: Branch | null;
  branches: Branch[];
  isReadOnly: boolean;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  daysRemaining: number;
}
