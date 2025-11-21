import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Package, 
  Clock,
  Truck,
  ArrowRight
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const EvmStaffDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalQuotations: 0,
    pendingQuotations: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalHandoverRecords: 0,
    acceptedHandoverRecords: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all data from APIs
        const [quotationsRes, ordersRes, handoverRes] = await Promise.allSettled([
          axiosInstance.get(endpoints.quotations.getAll, { params: { pageNumber: 1, pageSize: 1000 } }),
          axiosInstance.get(endpoints.orders.getAll, { params: { pageNumber: 1, pageSize: 1000 } }),
          axiosInstance.get(endpoints.handoverRecords.getAll, { params: { pageNumber: 1, pageSize: 1000 } })
        ]);

        // Extract data from responses
        const quotations = quotationsRes.status === 'fulfilled' 
          ? (quotationsRes.value?.data?.items || quotationsRes.value?.items || [])
          : [];
          
        const orders = ordersRes.status === 'fulfilled'
          ? (ordersRes.value?.data?.items || ordersRes.value?.items || [])
          : [];
          
        const handoverRecords = handoverRes.status === 'fulfilled'
          ? (handoverRes.value?.data?.items || handoverRes.value?.items || [])
          : [];

        // Filter B2B orders only
        const b2bOrders = orders.filter(o => o.orderType === 'B2B');

        console.log('📊 Dashboard data loaded:', {
          quotations: quotations.length,
          allOrders: orders.length,
          b2bOrders: b2bOrders.length,
          handoverRecords: handoverRecords.length
        });

        setStats({
          totalQuotations: quotations.length,
          pendingQuotations: quotations.filter(q => q.status === 'DRAFT' || q.status === 'PENDING').length,
          totalOrders: b2bOrders.length,
          pendingOrders: b2bOrders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length,
          completedOrders: b2bOrders.filter(o => o.status === 'COMPLETED').length,
          totalHandoverRecords: handoverRecords.length,
          acceptedHandoverRecords: handoverRecords.filter(h => h.isAccepted).length
        });
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, link }) => (
    <Link 
      to={link}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {loading ? '...' : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng đến EVM Staff Portal</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Báo giá"
          value={stats.totalQuotations}
          subtitle={`${stats.pendingQuotations} chờ xử lý`}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          link="/evm-staff/quotations"
        />
        
        <StatCard
          icon={Package}
          title="Đơn hàng (B2B)"
          value={stats.totalOrders}
          subtitle={`${stats.completedOrders} hoàn thành`}
          color="bg-gradient-to-br from-green-500 to-green-600"
          link="/evm-staff/orders"
        />
        
        <StatCard
          icon={Clock}
          title="Đơn hàng chờ xử lý"
          value={stats.pendingOrders}
          subtitle="Đang chờ xử lý"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          link="/evm-staff/orders"
        />
        
        <StatCard
          icon={Truck}
          title="Biên bản bàn giao"
          value={stats.totalHandoverRecords}
          subtitle={`${stats.acceptedHandoverRecords} đã chấp nhận`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          link="/evm-staff/handover-records"
        />
        </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/evm-staff/quotations/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Tạo báo giá</p>
              <p className="text-xs text-gray-500">Báo giá mới</p>
          </div>
          </Link>

          <Link
            to="/evm-staff/orders/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Package size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Tạo đơn hàng</p>
              <p className="text-xs text-gray-500">Xử lý đơn hàng</p>
          </div>
          </Link>

          <Link
            to="/evm-staff/handover-records/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Truck size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Bàn giao xe</p>
              <p className="text-xs text-gray-500">Bàn giao mới</p>
          </div>
          </Link>

          <Link
            to="/evm-staff/vehicles"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <Clock size={20} className="text-cyan-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Xem xe</p>
              <p className="text-xs text-gray-500">Kiểm tra kho</p>
          </div>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Trạng thái đơn hàng</h2>
            <Link to="/evm-staff/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đơn hàng hoàn thành</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {loading ? '...' : stats.completedOrders}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đơn hàng chờ xử lý</span>
              </div>
              <span className="text-lg font-bold text-yellow-700">
                {loading ? '...' : stats.pendingOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Handover Records Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Trạng thái bàn giao</h2>
            <Link to="/evm-staff/handover-records" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Biên bản đã chấp nhận</span>
                </div>
              <span className="text-lg font-bold text-green-700">
                {loading ? '...' : stats.acceptedHandoverRecords}
              </span>
                </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Tổng số biên bản</span>
              </div>
              <span className="text-lg font-bold text-gray-700">
                {loading ? '...' : stats.totalHandoverRecords}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvmStaffDashboardPage;
