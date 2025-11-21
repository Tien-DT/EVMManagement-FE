import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2,
  UserCheck,
  Car,
  Tag,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDealers: 0,
    activeDealers: 0,
    totalStaff: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalPromotions: 0,
    activePromotions: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel with large pageSize to get all records
        const [dealersRes, staffRes, vehiclesRes, promotionsRes] = await Promise.allSettled([
          axiosInstance.get(endpoints.admin.dealers, { params: { pageSize: 1000 } }),
          axiosInstance.get(endpoints.admin.evmStaff, { params: { pageSize: 1000 } }),
          axiosInstance.get(endpoints.admin.vehicleModels, { params: { pageSize: 1000 } }),
          axiosInstance.get(endpoints.admin.promotions, { params: { pageSize: 1000 } })
        ]);

        // Process dealers
        const dealers = dealersRes.status === 'fulfilled' 
          ? (dealersRes.value?.data?.items || dealersRes.value?.data || [])
          : [];
        
        // Process staff
        const staff = staffRes.status === 'fulfilled' 
          ? (staffRes.value?.data?.items || staffRes.value?.data || [])
          : [];
        
        // Filter EVM staff only
        const evmStaff = staff.filter(s => s.role === 'EVM_STAFF');
        
        // Process vehicles
        const vehicles = vehiclesRes.status === 'fulfilled'
          ? (vehiclesRes.value?.data?.items || vehiclesRes.value?.data || [])
          : [];
        
        // Process promotions
        const promotions = promotionsRes.status === 'fulfilled'
          ? (promotionsRes.value?.data?.items || promotionsRes.value?.data || [])
          : [];

        setStats({
          totalDealers: dealers.length,
          activeDealers: dealers.filter(d => d.isActive).length,
          totalStaff: evmStaff.length,
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter(v => v.isActive).length,
          totalPromotions: promotions.length,
          activePromotions: promotions.filter(p => p.isActive).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
          <p className="text-gray-600 mt-1">Chào mừng đến với Hệ thống Quản lý EVM</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          title="Tổng số Đại lý"
          value={stats.totalDealers}
          subtitle={`${stats.activeDealers} hoạt động`}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          link="/admin/dealers"
        />
        
        <StatCard
          icon={UserCheck}
          title="Nhân viên EVM"
          value={stats.totalStaff}
          subtitle="Thành viên"
          color="bg-gradient-to-br from-green-500 to-green-600"
          link="/admin/evm-staff"
        />
        
        <StatCard
          icon={Car}
          title="Model xe"
          value={stats.totalVehicles}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          link="/admin/vehiclemodels"
        />
        
        <StatCard
          icon={Tag}
          title="Khuyến mãi"
          value={stats.totalPromotions}
          subtitle={`${stats.activePromotions} hoạt động`}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          link="/admin/promotions"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/dealers/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Thêm Đại lý</p>
              <p className="text-xs text-gray-500">Tạo đại lý mới</p>
            </div>
          </Link>

          <Link
            to="/admin/evm-staff/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Thêm Nhân viên</p>
              <p className="text-xs text-gray-500">Đăng ký nhân viên mới</p>
            </div>
          </Link>

          <Link
            to="/admin/vehiclemodels/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Car size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Thêm Xe</p>
              <p className="text-xs text-gray-500">Model xe mới</p>
            </div>
          </Link>

          <Link
            to="/admin/promotions/new"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Tag size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Thêm Khuyến mãi</p>
              <p className="text-xs text-gray-500">Tạo khuyến mãi</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealers Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Trạng thái Đại lý</h2>
            <Link to="/admin/dealers" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đại lý hoạt động</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {loading ? '...' : stats.activeDealers}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đại lý không hoạt động</span>
              </div>
              <span className="text-lg font-bold text-gray-700">
                {loading ? '...' : stats.totalDealers - stats.activeDealers}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicles Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Trạng thái Xe</h2>
            <Link to="/admin/vehiclemodels" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Model có sẵn</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {loading ? '...' : stats.activeVehicles}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Model không hoạt động</span>
              </div>
              <span className="text-lg font-bold text-gray-700">
                {loading ? '...' : stats.totalVehicles - stats.activeVehicles}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
