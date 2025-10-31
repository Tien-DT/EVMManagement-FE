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
      // Use getOrderByIdWithDetails to get full order info including OrderDetails, Vehicle, Dealer
      const response = await orderService.getOrderByIdWithDetails(id);
      const orderData = response.data || response;
      console.log('Order with details:', orderData);
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
      case 'AWAITING_CONFIRM': return <Clock size={20} className="text-yellow-600" />;
      case 'CONFIRMED': return <CheckCircle size={20} className="text-green-600" />;
      case 'QUOTATION_RECEIVED': return <FileText size={20} className="text-purple-600" />;
      case 'QUOTATION_ACCEPTED': return <CheckCircle size={20} className="text-blue-600" />;
      case 'CREATED_CONTRACT': return <FileText size={20} className="text-indigo-600" />;
      case 'DEALER_SIGNED_CONTRACT': return <FileText size={20} className="text-teal-600" />;
      case 'SIGNED_CONTRACT': return <CheckCircle size={20} className="text-cyan-600" />;
      case 'AWAITING_DEPOSIT': return <Clock size={20} className="text-orange-600" />;
      case 'DEPOSIT_SUCCESS': return <CheckCircle size={20} className="text-teal-600" />;
      case 'IN_PROGRESS': return <Clock size={20} className="text-blue-600" />;
      case 'IN_TRANSIT': return <Package size={20} className="text-cyan-600" />;
      case 'READY_FOR_HANDOVER': return <CheckCircle size={20} className="text-green-600" />;
      case 'COMPLETED': return <CheckCircle size={20} className="text-emerald-600" />;
      case 'CANCELED': return <XCircle size={20} className="text-red-600" />;
      default: return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getStatusStyle = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'AWAITING_CONFIRM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'QUOTATION_RECEIVED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'QUOTATION_ACCEPTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CREATED_CONTRACT': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DEALER_SIGNED_CONTRACT': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'SIGNED_CONTRACT': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'AWAITING_DEPOSIT': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'DEPOSIT_SUCCESS': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_TRANSIT': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'READY_FOR_HANDOVER': return 'bg-green-50 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'AWAITING_CONFIRM': return 'Chờ EVM xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'QUOTATION_RECEIVED': return 'Đã gửi báo giá';
      case 'QUOTATION_ACCEPTED': return 'Báo giá được chấp nhận';
      case 'CREATED_CONTRACT': return 'Đã tạo hợp đồng';
      case 'DEALER_SIGNED_CONTRACT': return 'Dealer đã ký HĐ';
      case 'SIGNED_CONTRACT': return 'Hợp đồng đã ký';
      case 'AWAITING_DEPOSIT': return 'Chờ đặt cọc';
      case 'DEPOSIT_SUCCESS': return 'Đã đặt cọc';
      case 'IN_PROGRESS': return 'Đang chuẩn bị xe';
      case 'IN_TRANSIT': return 'Đang vận chuyển';
      case 'READY_FOR_HANDOVER': return 'Sẵn sàng bàn giao';
      case 'COMPLETED': return 'Hoàn thành';
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

  // Helper function to build order update data with all non-null fields
  const buildOrderUpdateData = (order, newStatus) => {
    const updateData = {
      code: order.code,
      dealerId: order.dealerId,
      status: newStatus,
      orderType: order.orderType,
    };
    
    // Add optional fields if they exist
    if (order.customerId) updateData.customerId = order.customerId;
    if (order.quotationId) updateData.quotationId = order.quotationId;
    if (order.handoverRecordId) updateData.handoverRecordId = order.handoverRecordId;
    if (order.contractId) updateData.contractId = order.contractId;
    if (order.depositId) updateData.depositId = order.depositId;
    if (order.note) updateData.note = order.note;
    if (order.totalAmount) updateData.totalAmount = order.totalAmount;
    if (order.discount) updateData.discount = order.discount;
    if (order.finalAmount) updateData.finalAmount = order.finalAmount;
    if (order.handoverDate) updateData.handoverDate = order.handoverDate;
    
    return updateData;
  };

  // Confirm order: AWAITING_CONFIRM → CONFIRMED
  const [isConfirming, setIsConfirming] = useState(false);
  const handleConfirmOrder = async () => {
    setIsConfirming(true);
    try {
      const updateData = buildOrderUpdateData(order, 'CONFIRMED');
      await orderService.updateOrder(order.id, updateData);
      showSuccess('Xác nhận đơn hàng thành công');
      fetchOrderDetails(); // Refresh order data
    } catch (error) {
      console.error('Error confirming order:', error);
      showError(error.response?.data?.message || 'Lỗi khi xác nhận đơn hàng');
    } finally {
      setIsConfirming(false);
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
          {order.status?.toUpperCase() === 'AWAITING_CONFIRM' && (
            <button
              onClick={handleConfirmOrder}
              disabled={isConfirming}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} />
              {isConfirming ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
            </button>
          )}
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
          {(order.dealer || order.dealerName) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đại lý</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {order.dealer?.name || order.dealerName}
                  </span>
                </div>
                {order.dealer?.address && (
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-700">{order.dealer.address}</span>
                  </div>
                )}
                {order.dealer?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{order.dealer.phoneNumber}</span>
                  </div>
                )}
                {order.dealer?.email && (
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{order.dealer.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Details - Vehicles */}
          {order.orderDetails && order.orderDetails.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} className="text-gray-600" />
                Danh sách xe
              </h2>
              <div className="space-y-4">
                {order.orderDetails.map((detail, index) => (
                  <div
                    key={detail.id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Vehicle Model & Variant */}
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart size={16} className="text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">
                            {detail.vehicleVariant?.vehicleModel?.name || 'N/A'}
                          </h3>
                        </div>

                        {/* Variant Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 ml-6">
                          {detail.vehicleVariant?.color && (
                            <div>
                              <span className="font-medium">Màu:</span> {detail.vehicleVariant.color}
                            </div>
                          )}
                          {detail.vehicleVariant?.engine && (
                            <div>
                              <span className="font-medium">Động cơ:</span> {detail.vehicleVariant.engine}
                            </div>
                          )}
                          {detail.vehicle?.vin && (
                            <div className="col-span-2">
                              <span className="font-medium">VIN:</span>
                              <span className="font-mono ml-1">{detail.vehicle.vin}</span>
                            </div>
                          )}
                          {detail.vehicle?.status !== undefined && (
                            <div>
                              <span className="font-medium">Trạng thái xe:</span> {detail.vehicle.status}
                            </div>
                          )}
                        </div>

                        {/* Note */}
                        {detail.note && (
                          <div className="mt-2 ml-6 text-xs text-gray-500 italic">
                            Ghi chú: {detail.note}
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-600 mb-1">
                          Số lượng: <span className="font-medium">{detail.quantity}</span>
                        </div>
                        <div className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(detail.unitPrice)}
                        </div>
                        {detail.discountPercent > 0 && (
                          <div className="text-xs text-red-600">
                            Giảm {detail.discountPercent}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Tổng: {formatCurrency(detail.unitPrice * detail.quantity * (100 - detail.discountPercent) / 100)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

