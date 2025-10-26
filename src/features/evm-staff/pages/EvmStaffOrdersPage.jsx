import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Car,
  DollarSign,
  Plus
} from 'lucide-react';
import useOrders from '../hooks/useOrders';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../services/orderService';
import customerService from '../services/customerService';

const EvmStaffOrdersPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { orders, loading, error, deleteOrder } = useOrders();
  const [customerCache, setCustomerCache] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'PROCESSING': return <Clock size={16} />;
      case 'CONFIRMED': return <CheckCircle size={16} />;
      case 'CANCELED': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PROCESSING': return 'Đang xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CANCELED': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  // Fetch customer info for orders (parallel for better performance)
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      // Get unique customer IDs that need to be fetched
      const customerIds = [...new Set(
        orders
          .filter(order => order.customerId && !order.customerName)
          .map(order => order.customerId)
      )];

      // Filter out already cached customers
      const idsToFetch = customerIds.filter(id => !customerCache[id]);

      if (idsToFetch.length === 0) return;

      // Fetch all customers in parallel using Promise.all
      const fetchPromises = idsToFetch.map(async (customerId) => {
        try {
          const response = await customerService.getCustomerById(customerId);
          const customerData = response.data || response;
          return {
            id: customerId,
            data: {
              name: customerData.name || customerData.fullName || 'N/A',
              email: customerData.email || '',
              phone: customerData.phoneNumber || customerData.phone || ''
            }
          };
        } catch (error) {
          console.error(`Error fetching customer ${customerId}:`, error);
          return {
            id: customerId,
            data: { name: 'N/A', email: '', phone: '' }
          };
        }
      });

      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);

      // Update cache once with all results
      const newCache = {};
      results.forEach(result => {
        newCache[result.id] = result.data;
      });

      setCustomerCache(prev => ({
        ...prev,
        ...newCache
      }));
    };

    if (orders.length > 0) {
      fetchCustomerInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // Helper function to get customer name
  const getCustomerName = (order) => {
    if (order.customerName) return order.customerName;
    if (order.customerId && customerCache[order.customerId]) {
      return customerCache[order.customerId].name;
    }
    return 'N/A';
  };

  // Helper function to get customer email
  const getCustomerEmail = (order) => {
    if (order.customerEmail) return order.customerEmail;
    if (order.customerId && customerCache[order.customerId]) {
      return customerCache[order.customerId].email;
    }
    return '-';
  };

  const filteredOrders = orders.filter(order => {
    const orderCode = order.code || orderService.generateOrderCode(order.id);
    const customerName = getCustomerName(order);
    const matchesSearch = orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.dealerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status?.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      showSuccess('Xóa đơn hàng thành công!');
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      showError(error.message || 'Có lỗi xảy ra khi xóa đơn hàng');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/evm-staff/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng xe điện</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/orders/create')}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Tạo đơn hàng mới
        </button>
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
              <p className="text-sm text-gray-600">Đã xác nhận</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status?.toUpperCase() === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status?.toUpperCase() === 'PROCESSING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-xl font-bold text-gray-900">
                {orders.filter(o => o.status?.toUpperCase() === 'COMPLETED').length}
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELED">Đã hủy</option>
          </select>
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
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {order.code || orderService.generateOrderCode(order.id)}
                      </div>
                      <div className="text-sm text-gray-500">{order.orderType || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-emerald-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{getCustomerName(order)}</div>
                          <div className="text-sm text-gray-500">{getCustomerEmail(order)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.vehicleModel || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.vehicleVariant || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-emerald-600" />
                        <div className="text-sm font-medium text-emerald-700">
                          {formatCurrency(order.finalAmount || order.totalAmount || 0)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{getStatusText(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        {order.createdDate ? new Date(order.createdDate).toLocaleDateString('vi-VN') :
                         order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(order)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xóa Đơn Hàng</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng{' '}
              <strong className="font-mono">{orderToDelete.code || orderService.generateOrderCode(orderToDelete.id)}</strong>
              {orderToDelete.customerName && (
                <> cho khách hàng <strong>{orderToDelete.customerName}</strong></>
              )}? 
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Xóa Đơn Hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffOrdersPage;
