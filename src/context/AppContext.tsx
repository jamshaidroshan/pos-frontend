import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Category, Product, Sale, Purchase, Supplier } from '../types';

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
}

const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@pos.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Store Manager',
      email: 'manager@pos.com',
      role: 'manager',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Cashier One',
      email: 'cashier@pos.com',
      role: 'cashier',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  categories: [
    { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', color: '#3B82F6' },
    { id: '2', name: 'Clothing', description: 'Apparel and fashion items', color: '#10B981' },
    { id: '3', name: 'Food & Beverages', description: 'Food items and drinks', color: '#F59E0B' },
    { id: '4', name: 'Books', description: 'Books and educational materials', color: '#8B5CF6' },
  ],
  products: [
    {
      id: '1',
      name: 'Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation',
      categoryId: '1',
      price: 199.99,
      cost: 120.00,
      stock: 25,
      minStock: 5,
      sku: 'WH001',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in various colors',
      categoryId: '2',
      price: 29.99,
      cost: 15.00,
      stock: 50,
      minStock: 10,
      sku: 'CT001',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Coffee Beans',
      description: 'Premium arabica coffee beans - 1kg bag',
      categoryId: '3',
      price: 24.99,
      cost: 12.00,
      stock: 8,
      minStock: 15,
      sku: 'CB001',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  sales: [],
  purchases: [],
  suppliers: [
    {
      id: '1',
      name: 'Tech Supplies Inc.',
      email: 'orders@techsupplies.com',
      phone: '+1-555-0101',
      address: '123 Tech Street, Silicon Valley, CA',
      isActive: true,
    },
    {
      id: '2',
      name: 'Fashion Wholesale',
      email: 'wholesale@fashion.com',
      phone: '+1-555-0202',
      address: '456 Fashion Ave, New York, NY',
      isActive: true,
    },
  ],
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_PURCHASE'; payload: Purchase }
  | { type: 'UPDATE_PURCHASE'; payload: { id: string; updates: Partial<Purchase> } }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: { id: string; updates: Partial<Supplier> } }
  | { type: 'LOAD_STATE'; payload: AppState };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload.updates } : user
        ),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? { ...cat, ...action.payload.updates } : cat
        ),
      };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? { ...product, ...action.payload.updates } : product
        ),
      };
    case 'ADD_SALE':
      // Update product stock when sale is made
      const updatedProducts = state.products.map(product => {
        const saleItem = action.payload.items.find(item => item.productId === product.id);
        if (saleItem) {
          return { ...product, stock: product.stock - saleItem.quantity };
        }
        return product;
      });
      return { 
        ...state, 
        sales: [...state.sales, action.payload],
        products: updatedProducts 
      };
    case 'ADD_PURCHASE':
      return { ...state, purchases: [...state.purchases, action.payload] };
    case 'UPDATE_PURCHASE':
      return {
        ...state,
        purchases: state.purchases.map(purchase =>
          purchase.id === action.payload.id ? { ...purchase, ...action.payload.updates } : purchase
        ),
      };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(supplier =>
          supplier.id === action.payload.id ? { ...supplier, ...action.payload.updates } : supplier
        ),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('pos-app-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsedState } });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pos-app-state', JSON.stringify(state));
  }, [state]);

  const login = (email: string, password: string): boolean => {
    // Simple authentication - in real app, this would be handled by backend
    const user = state.users.find(u => u.email === email && u.isActive);
    if (user && password === 'password') {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_USER', payload: user });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: { id, updates } });
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const category: Category = {
      ...categoryData,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const product: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const sale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SALE', payload: sale });
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const purchase: Purchase = {
      ...purchaseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PURCHASE', payload: purchase });
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    dispatch({ type: 'UPDATE_PURCHASE', payload: { id, updates } });
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const supplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    dispatch({ type: 'UPDATE_SUPPLIER', payload: { id, updates } });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        addUser,
        updateUser,
        addCategory,
        updateCategory,
        addProduct,
        updateProduct,
        addSale,
        addPurchase,
        updatePurchase,
        addSupplier,
        updateSupplier,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}