import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Car, 
  Package, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Activity,
  Truck,
  Calendar
} from 'lucide-react';
import useHandoverRecords from '../hooks/useHandoverRecords';

const EvmStaffDashboardPage = () => {
  // Fetch handover records data
  const { handoverRecords } = useHandoverRecords();
  
  // Mock data - thay bằng API call thực tế
  const [stats, setStats] = useState({
    totalVehicles: 156,
    availableVehicles: 89,
    soldThisMonth: 23,
    pendingOrders: 8,
    completedOrders: 45,
    canceledOrders: 3,
    totalRevenue: 1850000000,
    monthlyGrowth: 15.2
  });

  const [vehicleModels, setVehicleModels] = useState([
    { model: 'EVM Sedan Pro', available: 12, sold: 8, revenue: 480000000, percentage: 35 },
    { model: 'EVM SUV Max', available: 15, sold: 6, revenue: 420000000, percentage: 28 },
    { model: 'EVM Hatchback', available: 8, sold: 5, revenue: 200000000, percentage: 18 },
    { model: 'EVM Truck Heavy', available: 6, sold: 4, revenue: 320000000, percentage: 19 }
  ]);

  const [recentOrders, setRecentOrders] = useState([
    { id: '#ORD-2024-001', customer: 'Nguyễn Văn A', vehicle: 'EVM Sedan Pro', status: 'completed', date: '2024-01-15', amount: 650000000 },
    { id: '#ORD-2024-002', customer: 'Trần Thị B', vehicle: 'EVM SUV Max', status: 'processing', date: '2024-01-16', amount: 720000000 },
    { id: '#ORD-2024-003', customer: 'Lê Văn C', vehicle: 'EVM Hatchback', status: 'pending', date: '2024-01-17', amount: 450000000 },
    { id: '#ORD-2024-004', customer: 'Phạm Thị D', vehicle: 'EVM Truck Heavy', status: 'completed', date: '2024-01-18', amount: 890000000 },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { action: 'New vehicle added', vehicle: 'EVM Sedan Pro', time: '2 hours ago', type: 'success' },
    { action: 'Order completed', order: '#ORD-2024-001', time: '4 hours ago', type: 'success' },
    { action: 'Inventory updated', vehicle: 'EVM SUV Max', time: '6 hours ago', type: 'info' },
    { action: 'Customer inquiry', customer: 'Nguyễn Văn E', time: '8 hours ago', type: 'info' },
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

  const getActivityIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'info': return <AlertCircle size={16} className="text-blue-500" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">EVM Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">Quản lý xe điện và đơn hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Vehicles Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Car size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">TỔNG</span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Tổng Số Xe</h3>
          <p className="text-2xl font-bold">{stats.totalVehicles} xe</p>
          <div className="flex items-center mt-3 text-xs">
            <TrendingUp size={14} className="mr-1" />
            <span>{stats.availableVehicles} có sẵn</span>
          </div>
        </div>

        {/* Monthly Sales Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">THÁNG</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Xe Bán Tháng</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.soldThisMonth} xe</p>
          <div className="flex items-center mt-3 text-xs text-green-600">
            <TrendingUp size={14} className="mr-1" />
            <span>+{stats.monthlyGrowth}% so với tháng trước</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">DOANH THU</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Tổng Doanh Thu</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <div className="flex items-center mt-3 text-xs text-gray-500">
            <span>Tháng hiện tại</span>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">CHỜ XỬ LÝ</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Đơn Chờ</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders} đơn</p>
          <div className="flex items-center mt-3 text-xs text-gray-500">
            <span>{stats.completedOrders} hoàn thành, {stats.canceledOrders} hủy</span>
          </div>
        </div>

        {/* Handover Records Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Truck size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">BÀN GIAO</span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Bàn Giao Xe</h3>
          <p className="text-2xl font-bold">{handoverRecords.length} xe</p>
          <div className="flex items-center mt-3 text-xs">
            <CheckCircle size={14} className="mr-1" />
            <span>{handoverRecords.filter(r => r.isAccepted).length} đã chấp nhận</span>
          </div>
        </div>
      </div>

      {/* Vehicle Models Performance & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Models Performance */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hiệu Suất Theo Dòng Xe</h2>
          <div className="space-y-4">
            {vehicleModels.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {item.sold}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.model}</p>
                      <p className="text-sm text-gray-500">{item.available} có sẵn • {formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
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
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
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
                  <p className="text-sm text-gray-600">{order.customer} - {order.vehicle}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{order.date}</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(order.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Statistics & Handover Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Handover Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tình Trạng Bàn Giao</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-700 font-medium mb-1">Tổng Bàn Giao</p>
                  <p className="text-2xl font-bold text-cyan-900">{handoverRecords.length}</p>
                </div>
                <Truck size={32} className="text-cyan-600" />
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Đã Chấp Nhận</p>
                  <p className="text-2xl font-bold text-green-900">
                    {handoverRecords.filter(r => r.isAccepted).length}
                  </p>
                </div>
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium mb-1">Chờ Xác Nhận</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {handoverRecords.filter(r => !r.isAccepted).length}
                  </p>
                </div>
                <Clock size={32} className="text-yellow-600" />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Tháng Này</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {handoverRecords.filter(r => {
                      const recordDate = new Date(r.handoverDate);
                      const now = new Date();
                      return recordDate.getMonth() === now.getMonth() && 
                             recordDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar size={32} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Hoạt Động Gần Đây</h2>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Xem tất cả →
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {activity.vehicle && `${activity.vehicle} • `}
                    {activity.order && `${activity.order} • `}
                    {activity.customer && `${activity.customer} • `}
                    <span className="text-gray-400">{activity.time}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvmStaffDashboardPage;
