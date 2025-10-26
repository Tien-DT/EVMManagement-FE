import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart,
  Calendar,
  User,
  Building,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Package
} from 'lucide-react';
import useOrders from '../hooks/useOrders';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../services/orderService';

const EvmStaffOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getOrderById, deleteOrder, loading } = useOrders(false);
  
  const [order, setOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await getOrderById(id);
      const orderData = response.data || response;
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Không thể tải thông tin đơn hàng');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'COMPLETED': return <CheckCircle size={20} className="text-emerald-600" />;
      case 'PROCESSING': return <Clock size={20} className="text-blue-600" />;
      case 'CONFIRMED': return <CheckCircle size={20} className="text-green-600" />;
      case 'CANCELED': return <XCircle size={20} className="text-red-600" />;
      default: return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getStatusStyle = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrder(id);
      showSuccess('Xóa đơn hàng thành công');
      navigate('/evm-staff/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      showError(error.response?.data?.message || 'Không thể xóa đơn hàng');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/evm-staff/orders')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Đơn hàng {order.code || orderService.generateOrderCode(order.id)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Chi tiết đơn hàng</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/evm-staff/orders/${id}/edit`)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        {getStatusIcon(order.status)}
        <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded border-2 ${getStatusStyle(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Mã đơn hàng</label>
                  <p className="text-sm font-mono font-medium text-gray-900 mt-1">
                    {order.code || orderService.generateOrderCode(order.id)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Loại đơn</label>
                  <p className="text-sm text-gray-900 mt-1">{order.orderType || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Trạng thái</label>
                  <p className="text-sm text-gray-900 mt-1">{getStatusText(order.status)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Trả góp</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {order.isFinanced ? 'Có' : 'Không'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Ngày giao hàng dự kiến</label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(order.expectedDeliveryAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm text-gray-900">{order.customerName || 'N/A'}</span>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{order.customerEmail}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dealer Information */}
          {order.dealerName && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đại lý</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{order.dealerName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Financial & Metadata */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Chi tiết thanh toán</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng tiền</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Giảm giá</span>
                <span className="text-sm font-medium text-red-600">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Thành tiền</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">Ngày tạo</span>
                </div>
                <p className="text-sm text-gray-900 ml-5">
                  {formatDate(order.createdAt || order.createdDate)}
                </p>
              </div>

              {order.updatedAt && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Cập nhật</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">{formatDate(order.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related IDs */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xs font-medium text-gray-600 mb-3">Liên kết</h3>
            <div className="space-y-2">
              {order.quotationId && (
                <div>
                  <label className="text-xs text-gray-500">Báo giá</label>
                  <p className="text-xs font-mono text-gray-900">{order.quotationId}</p>
                </div>
              )}
              {order.customerId && (
                <div>
                  <label className="text-xs text-gray-500">Khách hàng ID</label>
                  <p className="text-xs font-mono text-gray-900">{order.customerId}</p>
                </div>
              )}
              {order.dealerId && (
                <div>
                  <label className="text-xs text-gray-500">Đại lý ID</label>
                  <p className="text-xs font-mono text-gray-900">{order.dealerId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xóa Đơn Hàng</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng <strong className="font-mono">{order.code || orderService.generateOrderCode(order.id)}</strong>? 
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
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

export default EvmStaffOrderDetailPage;

