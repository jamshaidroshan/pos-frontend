export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  sku: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  customerId?: string;
  cashierId: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  createdAt: string;
  receivedAt?: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  cost: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  categories: Category[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  suppliers: Supplier[];
}