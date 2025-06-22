import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Receipt,
  X
} from 'lucide-react';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
}

export default function Sales() {
  const { state, addSale } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [customerDiscount, setCustomerDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  // Filter active products
  const availableProducts = state.products.filter(p => p.isActive && p.stock > 0);
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        quantity: 1,
        price: product.price,
        discount: 0
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else if (quantity <= product.stock) {
      setCart(cart.map(item =>
        item.productId === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const updateDiscount = (productId: string, discount: number) => {
    setCart(cart.map(item =>
      item.productId === productId 
        ? { ...item, discount: Math.max(0, Math.min(100, discount)) }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = itemTotal * (item.discount / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);
    
    const globalDiscount = subtotal * (customerDiscount / 100);
    const discountedSubtotal = subtotal - globalDiscount;
    const tax = discountedSubtotal * 0.08; // 8% tax
    const total = discountedSubtotal + tax;

    return {
      subtotal,
      globalDiscount,
      tax,
      total
    };
  };

  const processSale = () => {
    if (cart.length === 0) return;

    const totals = calculateTotals();
    const sale = {
      items: cart,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.globalDiscount,
      total: totals.total,
      paymentMethod,
      cashierId: state.currentUser!.id
    };

    addSale(sale);
    setLastSale({
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      items: cart.map(item => ({
        ...item,
        product: state.products.find(p => p.id === item.productId)
      }))
    });
    setCart([]);
    setCustomerDiscount(0);
    setShowReceipt(true);
  };

  const totals = calculateTotals();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map(product => {
              const category = state.categories.find(c => c.id === product.categoryId);
              const inCart = cart.find(item => item.productId === product.id);
              
              return (
                <div 
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                    {inCart && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{product.sku}</p>
                  {category && (
                    <span 
                      className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white mb-2"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-600">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{product.stock} left</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {cart.length} items
            </span>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
            {cart.map(item => {
              const product = state.products.find(p => p.id === item.productId);
              if (!product) return null;

              const itemTotal = item.price * item.quantity;
              const itemDiscount = itemTotal * (item.discount / 100);
              const finalPrice = itemTotal - itemDiscount;

              return (
                <div key={item.productId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= product.stock}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold">${finalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Discount %:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => updateDiscount(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
            </div>
          )}

          {/* Customer Discount */}
          {cart.length > 0 && (
            <div className="border-t pt-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Customer Discount %:</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={customerDiscount}
                  onChange={(e) => setCustomerDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Totals */}
          {cart.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.globalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-${totals.globalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {cart.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-medium">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-medium">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('digital')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'digital' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-medium">Digital</span>
                </button>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          {cart.length > 0 && (
            <button
              onClick={processSale}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Receipt className="w-5 h-5" />
              Process Sale
            </button>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Receipt</h3>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">POS Pro</h2>
                <p className="text-sm text-gray-600">Receipt #{lastSale.id.slice(-6)}</p>
                <p className="text-sm text-gray-600">
                  {new Date(lastSale.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {lastSale.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} x {item.quantity}
                        {item.discount > 0 && ` (-${item.discount}%)`}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${((item.price * item.quantity) * (1 - item.discount / 100)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${lastSale.subtotal.toFixed(2)}</span>
                </div>
                {lastSale.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${lastSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${lastSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${lastSale.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm text-gray-600 capitalize">
                  Payment: {lastSale.paymentMethod}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Thank you for your business!
                </p>
              </div>

              <button
                onClick={() => setShowReceipt(false)}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}