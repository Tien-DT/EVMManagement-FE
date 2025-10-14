import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
  // Mock data - thay bằng API call thực tế
  const [stats, setStats] = useState({
    monthlyRevenue: 125000000,
    quarterlySales: 45,
    inventoryCount: 28,
    pendingOrders: 12,
    completedOrders: 33,
    canceledOrders: 2
  });

  const [salesByModel, setSalesByModel] = useState([
    { model: 'Sedan A', sales: 15, revenue: 45000000, percentage: 33 },
    { model: 'SUV B', sales: 12, revenue: 48000000, percentage: 27 },
    { model: 'Hatchback C', sales: 10, revenue: 20000000, percentage: 22 },
    { model: 'Truck D', sales: 8, revenue: 32000000, percentage: 18 }
  ]);

  const [recentOrders, setRecentOrders] = useState([
    { id: '#ORD-001', customer: 'Nguyễn Văn A', model: 'Sedan A', status: 'completed', date: '2025-10-12' },
    { id: '#ORD-002', customer: 'Trần Thị B', model: 'SUV B', status: 'pending', date: '2025-10-13' },
    { id: '#ORD-003', customer: 'Lê Văn C', model: 'Truck D', status: 'processing', date: '2025-10-14' },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'processing': return <AlertCircle size={16} />;
      case 'canceled': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">THÁNG</span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Doanh Thu</h3>
          <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
          <div className="flex items-center mt-3 text-xs">
            <TrendingUp size={14} className="mr-1" />
            <span>+12.5% so với tháng trước</span>
          </div>
        </div>

        {/* Quarterly Sales Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">QUÝ</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Xe Bán Ra</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.quarterlySales} xe</p>
          <div className="flex items-center mt-3 text-xs text-green-600">
            <TrendingUp size={14} className="mr-1" />
            <span>+8.3% so với quý trước</span>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">HIỆN TẠI</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Tồn Kho</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.inventoryCount} xe</p>
          <div className="flex items-center mt-3 text-xs text-gray-500">
            <span>Cần nhập thêm 12 xe</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">ĐANG XỬ LÝ</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Đơn Chờ</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders} đơn</p>
          <div className="flex items-center mt-3 text-xs text-gray-500">
            <span>{stats.completedOrders} hoàn thành, {stats.canceledOrders} hủy</span>
          </div>
        </div>
      </div>

      {/* Sales by Model & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Model */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Doanh Số Theo Dòng Xe</h2>
          <div className="space-y-4">
            {salesByModel.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {item.sales}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.model}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Đơn Hàng Gần Đây</h2>
            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Xem tất cả →
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.customer} - {order.model}</p>
                  <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tình Trạng Đơn Hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Hoàn Thành</p>
                <p className="text-2xl font-bold text-green-900">{stats.completedOrders}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium mb-1">Đang Xử Lý</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
              </div>
              <Clock size={32} className="text-yellow-600" />
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium mb-1">Đã Hủy</p>
                <p className="text-2xl font-bold text-red-900">{stats.canceledOrders}</p>
              </div>
              <XCircle size={32} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;