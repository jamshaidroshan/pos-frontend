import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Calendar,
  Download,
  Filter,
  Eye
} from 'lucide-react';

export default function Reports() {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState('7'); // days
  const [reportType, setReportType] = useState('sales');

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return { start, end };
  };

  // Filter data by date range
  const { start, end } = getDateRange();
  const filteredSales = state.sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= start && saleDate <= end;
  });

  // Sales Analytics
  const salesAnalytics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Group by date
    const salesByDate = filteredSales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = { revenue: 0, count: 0 };
      }
      acc[date].revenue += sale.total;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    // Payment method breakdown
    const paymentMethods = filteredSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      salesByDate,
      paymentMethods
    };
  }, [filteredSales]);

  // Product Analytics
  const productAnalytics = useMemo(() => {
    // Calculate total stock value
    const totalStockValue = state.products.reduce((sum, product) => 
      sum + (product.stock * product.cost), 0
    );

    // Low stock products
    const lowStockProducts = state.products.filter(p => p.stock <= p.minStock);

    // Best selling products (from sales)
    const productSales = filteredSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        if (!acc[item.productId]) {
          acc[item.productId] = { quantity: 0, revenue: 0 };
        }
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].revenue += (item.price * item.quantity * (1 - item.discount / 100));
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    const bestSellingProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        product: state.products.find(p => p.id === productId),
        ...data
      }))
      .filter(item => item.product)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      bestSellingProducts,
      totalProducts: state.products.length,
      activeProducts: state.products.filter(p => p.isActive).length
    };
  }, [state.products, filteredSales]);

  // User Analytics
  const userAnalytics = useMemo(() => {
    const cashierPerformance = state.users
      .filter(user => user.role === 'cashier')
      .map(cashier => {
        const cashierSales = filteredSales.filter(sale => sale.cashierId === cashier.id);
        const revenue = cashierSales.reduce((sum, sale) => sum + sale.total, 0);
        return {
          cashier,
          salesCount: cashierSales.length,
          revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalUsers: state.users.length,
      activeUsers: state.users.filter(u => u.isActive).length,
      cashierPerformance
    };
  }, [state.users, filteredSales]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="users">User Performance</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4" />
            {reportType === 'sales' && `${filteredSales.length} sales`}
            {reportType === 'inventory' && `${state.products.length} products`}
            {reportType === 'users' && `${state.users.length} users`}
          </div>
        </div>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          {/* Sales Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(salesAnalytics.totalRevenue)}
              icon={DollarSign}
              color="bg-green-500"
            />
            <StatCard
              title="Total Sales"
              value={salesAnalytics.totalSales.toString()}
              icon={ShoppingCart}
              color="bg-blue-500"
            />
            <StatCard
              title="Average Order Value"
              value={formatCurrency(salesAnalytics.averageOrderValue)}
              icon={TrendingUp}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Sales</h3>
              <div className="space-y-4">
                {Object.entries(salesAnalytics.salesByDate)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .slice(-7)
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{data.count} sales</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(data.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
              <div className="space-y-4">
                {Object.entries(salesAnalytics.paymentMethods).map(([method, count]) => {
                  const percentage = (count / salesAnalytics.totalSales * 100).toFixed(1);
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          method === 'cash' ? 'bg-green-500' : 
                          method === 'card' ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <span className="capitalize font-medium">{method}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{count} sales</div>
                        <div className="text-xs text-gray-500">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Stock Value"
              value={formatCurrency(productAnalytics.totalStockValue)}
              icon={DollarSign}
              color="bg-green-500"
            />
            <StatCard
              title="Total Products"
              value={productAnalytics.totalProducts.toString()}
              icon={Package}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Products"
              value={productAnalytics.activeProducts.toString()}
              icon={TrendingUp}
              color="bg-purple-500"
            />
            <StatCard
              title="Low Stock Items"
              value={productAnalytics.lowStockCount.toString()}
              icon={TrendingDown}
              color="bg-red-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Selling Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Best Selling Products</h3>
              <div className="space-y-4">
                {productAnalytics.bestSellingProducts.map((item, index) => (
                  <div key={item.product?.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">{item.product?.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.quantity} sold</p>
                      <p className="text-sm text-green-600">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))}
                {productAnalytics.bestSellingProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No sales data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
              <div className="space-y-4">
                {state.categories.map(category => {
                  const categoryProducts = state.products.filter(p => p.categoryId === category.id);
                  const totalValue = categoryProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0);
                  return (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{categoryProducts.length} products</p>
                        <p className="text-sm text-gray-600">{formatCurrency(totalValue)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Performance Report */}
      {reportType === 'users' && (
        <div className="space-y-6">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={userAnalytics.totalUsers.toString()}
              icon={Package}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Users"
              value={userAnalytics.activeUsers.toString()}
              icon={TrendingUp}
              color="bg-green-500"
            />
            <StatCard
              title="Cashiers"
              value={state.users.filter(u => u.role === 'cashier').length.toString()}
              icon={ShoppingCart}
              color="bg-purple-500"
            />
          </div>

          {/* Cashier Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Cashier Performance</h3>
            <div className="space-y-4">
              {userAnalytics.cashierPerformance.map((performance, index) => (
                <div key={performance.cashier.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performance.cashier.name}</p>
                      <p className="text-sm text-gray-600">{performance.cashier.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{performance.salesCount} sales</p>
                    <p className="text-sm text-green-600">{formatCurrency(performance.revenue)}</p>
                  </div>
                </div>
              ))}
              {userAnalytics.cashierPerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}