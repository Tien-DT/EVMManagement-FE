import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Car
} from 'lucide-react';

const EvmStaffOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-2024-001',
          customer: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0123456789',
          vehicle: 'EVM Sedan Pro',
          variant: 'Standard',
          price: 650000000,
          status: 'completed',
          orderDate: '2024-01-15',
          deliveryDate: '2024-01-20',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 'ORD-2024-002',
          customer: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0987654321',
          vehicle: 'EVM SUV Max',
          variant: 'Premium',
          price: 850000000,
          status: 'processing',
          orderDate: '2024-01-16',
          deliveryDate: '2024-01-25',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'ORD-2024-003',
          customer: 'Lê Văn C',
          email: 'levanc@email.com',
          phone: '0369852147',
          vehicle: 'EVM Hatchback',
          variant: 'Eco',
          price: 450000000,
          status: 'pending',
          orderDate: '2024-01-17',
          deliveryDate: '2024-01-22',
          paymentMethod: 'Cash'
        },
        {
          id: 'ORD-2024-004',
          customer: 'Phạm Thị D',
          email: 'phamthid@email.com',
          phone: '0741852963',
          vehicle: 'EVM Truck Heavy',
          variant: 'Commercial',
          price: 1200000000,
          status: 'cancelled',
          orderDate: '2024-01-18',
          deliveryDate: '2024-01-28',
          paymentMethod: 'Bank Transfer'
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng xe điện</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đã hủy</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'cancelled').length}
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
                placeholder="Tìm kiếm theo ID, khách hàng hoặc xe..."
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
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Filter size={20} className="mr-2" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-emerald-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                          <div className="text-sm text-gray-500">{order.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.vehicle}</div>
                          <div className="text-sm text-gray-500">{order.variant}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-emerald-600 hover:text-emerald-900 mr-3">
                        <Eye size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng nào</h3>
          <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
};

export default EvmStaffOrdersPage;
