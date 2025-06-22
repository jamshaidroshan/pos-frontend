import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  DollarSign,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { state } = useApp();

  // Calculate statistics
  const totalProducts = state.products.length;
  const activeProducts = state.products.filter(p => p.isActive).length;
  const lowStockProducts = state.products.filter(p => p.stock <= p.minStock).length;
  const totalUsers = state.users.filter(u => u.isActive).length;

  // Calculate sales statistics
  const todaySales = state.sales.filter(sale => {
    const today = new Date().toDateString();
    return new Date(sale.createdAt).toDateString() === today;
  });
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = state.sales.length;
  const totalRevenue = state.sales.reduce((sum, sale) => sum + sale.total, 0);

  // Get recent sales
  const recentSales = state.sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      name: "Today's Revenue",
      value: `$${todayRevenue.toFixed(2)}`,
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Total Sales',
      value: totalSales.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Products',
      value: activeProducts.toString(),
      change: `${totalProducts - activeProducts} inactive`,
      changeType: 'neutral',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Users',
      value: totalUsers.toString(),
      change: '+2 this month',
      changeType: 'positive',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {state.currentUser?.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
                  {stat.changeType === 'negative' && <TrendingDown className="w-4 h-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low stock alerts */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product) => {
                const category = state.categories.find(c => c.id === product.categoryId);
                return (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{category?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">{product.stock} left</p>
                      <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sales recorded yet</p>
              </div>
            ) : (
              recentSales.map((sale) => {
                const cashier = state.users.find(u => u.id === sale.cashierId);
                return (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Sale #{sale.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {cashier?.name} • {sale.items.length} items
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${sale.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 capitalize">{sale.paymentMethod}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group">
            <ShoppingCart className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-blue-900">New Sale</p>
            <p className="text-sm text-blue-600">Process a new transaction</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group">
            <Package className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-green-900">Add Product</p>
            <p className="text-sm text-green-600">Add new inventory item</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group">
            <Users className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-purple-900">Manage Users</p>
            <p className="text-sm text-purple-600">Add or edit user accounts</p>
          </button>
        </div>
      </div>
    </div>
  );
}