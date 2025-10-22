import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car
} from 'lucide-react';

const EvmStaffCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCustomers([
        {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0123456789',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          registrationDate: '2024-01-15',
          totalOrders: 3,
          totalSpent: 1950000000,
          status: 'active',
          lastOrder: '2024-01-20',
          vehicles: ['EVM Sedan Pro', 'EVM SUV Max']
        },
        {
          id: 2,
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0987654321',
          address: '456 Đường XYZ, Quận 2, TP.HCM',
          registrationDate: '2024-01-16',
          totalOrders: 1,
          totalSpent: 850000000,
          status: 'active',
          lastOrder: '2024-01-16',
          vehicles: ['EVM SUV Max']
        },
        {
          id: 3,
          name: 'Lê Văn C',
          email: 'levanc@email.com',
          phone: '0369852147',
          address: '789 Đường DEF, Quận 3, TP.HCM',
          registrationDate: '2024-01-17',
          totalOrders: 2,
          totalSpent: 900000000,
          status: 'inactive',
          lastOrder: '2024-01-18',
          vehicles: ['EVM Hatchback']
        },
        {
          id: 4,
          name: 'Phạm Thị D',
          email: 'phamthid@email.com',
          phone: '0741852963',
          address: '321 Đường GHI, Quận 4, TP.HCM',
          registrationDate: '2024-01-18',
          totalOrders: 0,
          totalSpent: 0,
          status: 'prospect',
          lastOrder: null,
          vehicles: []
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'prospect': return 'Tiềm năng';
      default: return 'Không xác định';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý thông tin khách hàng</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center">
          <Plus size={20} className="mr-2" />
          Thêm Khách Hàng
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
              <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Hoạt động</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tiềm năng</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'prospect').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Car size={20} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="prospect">Tiềm năng</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Filter size={20} className="mr-2" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Customer Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {getStatusText(customer.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-2 text-emerald-500" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2 text-emerald-500" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-emerald-500" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{customer.totalOrders}</p>
                  <p className="text-xs text-gray-500">Đơn hàng</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-gray-500">Tổng chi</p>
                </div>
              </div>

              {/* Vehicles */}
              {customer.vehicles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Xe đã mua:</p>
                  <div className="flex flex-wrap gap-1">
                    {customer.vehicles.map((vehicle, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                        <Car size={12} className="mr-1" />
                        {vehicle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Date */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar size={16} className="mr-2" />
                <span>Đăng ký: {new Date(customer.registrationDate).toLocaleDateString('vi-VN')}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center">
                  <Eye size={16} className="mr-1" />
                  Xem
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khách hàng nào</h3>
          <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
};

export default EvmStaffCustomersPage;
