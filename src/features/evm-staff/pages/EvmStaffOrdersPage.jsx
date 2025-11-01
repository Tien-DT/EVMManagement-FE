import React, { useState } from 'react';
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
  Plus,
  FileText
} from 'lucide-react';
import useOrders from '../hooks/useOrders';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../services/orderService';
import quotationService from '../services/quotationService';
import CreateContractModal from '../components/CreateContractModal';
import CreateDepositModal from '../components/CreateDepositModal';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const EvmStaffOrdersPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedOrderForQuotation, setSelectedOrderForQuotation] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedOrderForContract, setSelectedOrderForContract] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedOrderForDeposit, setSelectedOrderForDeposit] = useState(null);

  const { orders, loading, error, deleteOrder } = useOrders();

  // Filter only B2B orders (OrderType = 1 or "B2B")
  const b2bOrders = orders.filter(order => {
    const orderType = order.orderType;
    return orderType === 1 || orderType === "B2B" || String(orderType).toUpperCase() === "B2B";
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'AWAITING_CONFIRM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'QUOTATION_RECEIVED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'QUOTATION_ACCEPTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUOTATION_REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      case 'CREATED_CONTRACT': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SIGNED_CONTRACT': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'DEALER_SIGNED_CONTRACT': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'AWAITING_DEPOSIT': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'DEPOSIT_SUCCESS': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_TRANSIT': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'READY_FOR_HANDOVER': return 'bg-lime-50 text-lime-700 border-lime-200';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'AWAITING_CONFIRM': return <Clock size={16} />;
      case 'CONFIRMED': return <CheckCircle size={16} />;
      case 'QUOTATION_RECEIVED': return <FileText size={16} />;
      case 'QUOTATION_ACCEPTED': return <CheckCircle size={16} />;
      case 'QUOTATION_REJECTED': return <XCircle size={16} />;
      case 'CREATED_CONTRACT': return <FileText size={16} />;
      case 'SIGNED_CONTRACT': return <CheckCircle size={16} />;
      case 'DEALER_SIGNED_CONTRACT': return <FileText size={16} />;
      case 'AWAITING_DEPOSIT': return <Clock size={16} />;
      case 'DEPOSIT_SUCCESS': return <DollarSign size={16} />;
      case 'IN_PROGRESS': return <Clock size={16} />;
      case 'IN_TRANSIT': return <Car size={16} />;
      case 'READY_FOR_HANDOVER': return <CheckCircle size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'CANCELED': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'AWAITING_CONFIRM': return 'Chờ EVM xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'QUOTATION_RECEIVED': return 'Đã gửi báo giá';
      case 'QUOTATION_ACCEPTED': return 'Báo giá được chấp nhận';
      case 'QUOTATION_REJECTED': return 'Báo giá bị từ chối';
      case 'CREATED_CONTRACT': return 'Đã tạo hợp đồng';
      case 'SIGNED_CONTRACT': return 'Hợp đồng đã ký';
      case 'DEALER_SIGNED_CONTRACT': return 'Dealer đã ký HĐ';
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

  // Helper function to get dealer name (for B2B orders, customer column should show Dealer Name)
  const getDealerName = (order) => {
    // For B2B orders, show dealer name in customer column
    if (order.dealer?.name) return order.dealer.name;
    if (order.dealerName) return order.dealerName;
    return 'N/A';
  };

  // Helper function to get dealer email
  const getDealerEmail = (order) => {
    if (order.dealer?.email) return order.dealer.email;
    if (order.dealerEmail) return order.dealerEmail;
    return '-';
  };

  // Helper function to get vehicle info from OrderDetails
  const getVehicleInfo = (order) => {
    // Debug: Log the order structure
    console.log('Order data:', order);
    console.log('OrderDetails:', order.orderDetails);

    // Get first order detail (assuming one vehicle per order for display)
    if (order.orderDetails && order.orderDetails.length > 0) {
      const firstDetail = order.orderDetails[0];
      console.log('First OrderDetail:', firstDetail);
      const vehicleVariant = firstDetail.vehicleVariant;
      console.log('VehicleVariant:', vehicleVariant);

      if (vehicleVariant) {
        const modelName = vehicleVariant.vehicleModel?.name || 'N/A';
        const color = vehicleVariant.color || '';
        console.log('Model Name:', modelName, 'Color:', color);
        return {
          model: modelName,
          variant: color
        };
      }
    }

    // Fallback to old properties if available
    console.log('Using fallback - vehicleModel:', order.vehicleModel, 'vehicleVariant:', order.vehicleVariant);
    return {
      model: order.vehicleModel || 'N/A',
      variant: order.vehicleVariant || '-'
    };
  };

  const filteredOrders = b2bOrders.filter(order => {
    const orderCode = order.code || orderService.generateOrderCode(order.id);
    const dealerName = getDealerName(order);
    const vehicleInfo = getVehicleInfo(order);
    const matchesSearch = orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicleInfo.model?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleCreateQuotation = () => {
    if (!selectedOrderForQuotation) return;
    // Navigate to create quotation page with order info
    navigate(`/evm-staff/quotations/create?orderId=${selectedOrderForQuotation.id}`);
  };

  const handleCreateContract = async (order) => {
    try {
      // Load quotation details
      const quotationResponse = await axiosInstance.get(endpoints.quotations.getById(order.quotationId));
      setSelectedQuotation(quotationResponse.data);
      setSelectedOrderForContract(order);
      setShowContractModal(true);
    } catch (error) {
      console.error('Error loading quotation:', error);
      showError('Không thể tải thông tin báo giá');
    }
  };

  const handleContractCreated = () => {
    // Refresh orders list
    window.location.reload();
  };

  const handleCreateDeposit = (order) => {
    setSelectedOrderForDeposit(order);
    setShowDepositModal(true);
  };

  const handleDepositCreated = () => {
    window.location.reload();
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

  // Update order status to AWAITING_DEPOSIT after contract signed
  const handleUpdateStatusToAwaitingDeposit = async (order) => {
    try {
      const updateData = buildOrderUpdateData(order, 'AWAITING_DEPOSIT');
      await axiosInstance.put(endpoints.orders.update(order.id), updateData);
      showSuccess('Đã cập nhật trạng thái → Chờ đặt cọc');
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Lỗi khi cập nhật trạng thái');
    }
  };

  // Prepare vehicle: DEPOSIT_SUCCESS → IN_PROGRESS
  const handlePrepareVehicle = async (order) => {
    try {
      const updateData = buildOrderUpdateData(order, 'IN_PROGRESS');
      await axiosInstance.put(endpoints.orders.update(order.id), updateData);
      showSuccess('Đã chuyển sang trạng thái Đang chuẩn bị xe');
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Lỗi khi cập nhật trạng thái');
    }
  };

  // Confirm deposit received: AWAITING_DEPOSIT → DEPOSIT_SUCCESS
  const handleConfirmDepositReceived = async (order) => {
    try {
      const updateData = buildOrderUpdateData(order, 'DEPOSIT_SUCCESS');
      await axiosInstance.put(endpoints.orders.update(order.id), updateData);
      showSuccess('Đã xác nhận nhận tiền đặt cọc');
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Lỗi khi xác nhận nhận tiền');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng B2B</h1>
          <p className="text-gray-600 mt-1">Tạo báo giá cho đơn hàng B2B từ Dealer</p>
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
              <p className="text-sm text-gray-600">Tổng đơn B2B</p>
              <p className="text-xl font-bold text-gray-900">{b2bOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chờ xác nhận</p>
              <p className="text-xl font-bold text-gray-900">
                {b2bOrders.filter(o => o.status?.toUpperCase() === 'AWAITING_CONFIRM').length}
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
              <p className="text-sm text-gray-600">Đã có báo giá</p>
              <p className="text-xl font-bold text-gray-900">
                {b2bOrders.filter(o => o.quotationId != null).length}
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
              <p className="text-sm text-gray-600">Chờ Dealer</p>
              <p className="text-xl font-bold text-gray-900">
                {b2bOrders.filter(o => o.status?.toUpperCase() === 'AWAITING_DEPOSIT').length}
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
            <option value="AWAITING_CONFIRM">Chờ EVM xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="QUOTATION_RECEIVED">Đã gửi báo giá</option>
            <option value="QUOTATION_ACCEPTED">Báo giá được chấp nhận</option>
            <option value="QUOTATION_REJECTED">Báo giá bị từ chối</option>
            <option value="CREATED_CONTRACT">Đã tạo hợp đồng</option>
            <option value="SIGNED_CONTRACT">EVM đã ký HĐ</option>
            <option value="DEALER_SIGNED_CONTRACT">Dealer đã ký HĐ</option>
            <option value="AWAITING_DEPOSIT">Chờ đặt cọc</option>
            <option value="DEPOSIT_SUCCESS">Đã đặt cọc</option>
            <option value="IN_PROGRESS">Đang chuẩn bị xe</option>
            <option value="IN_TRANSIT">Đang vận chuyển</option>
            <option value="READY_FOR_HANDOVER">Sẵn sàng bàn giao</option>
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
                    Báo giá
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
                          <div className="text-sm font-medium text-gray-900">{getDealerName(order)}</div>
                          <div className="text-sm text-gray-500">{getDealerEmail(order)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getVehicleInfo(order).model}</div>
                          <div className="text-sm text-gray-500">{getVehicleInfo(order).variant}</div>
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
                      {order.quotationId ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} className="mr-1" />
                          Đã có báo giá
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          <Clock size={14} className="mr-1" />
                          Chờ báo giá
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        {order.createdDate ? new Date(order.createdDate).toLocaleDateString('vi-VN') :
                         order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* 1. CONFIRMED → Nút "Tạo báo giá" */}
                        {order.status?.toUpperCase() === 'CONFIRMED' && !order.quotationId && (
                          <button
                            onClick={() => {
                              setSelectedOrderForQuotation(order);
                              setShowQuotationModal(true);
                            }}
                            className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 flex items-center gap-1"
                            title="Tạo báo giá"
                          >
                            <Plus size={14} />
                            <span className="text-xs font-medium">Tạo báo giá</span>
                          </button>
                        )}

                        {/* 2. QUOTATION_RECEIVED → Badge "Đã gửi báo giá - Chờ dealer" */}
                        {order.status?.toUpperCase() === 'QUOTATION_RECEIVED' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                            <FileText size={14} />
                            <span className="text-xs font-medium">Đã gửi - Chờ dealer</span>
                          </span>
                        )}

                        {/* 3. QUOTATION_ACCEPTED → Nút "Tạo hợp đồng" */}
                        {order.status?.toUpperCase() === 'QUOTATION_ACCEPTED' && !order.contractId && (
                          <button
                            onClick={() => handleCreateContract(order)}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 flex items-center gap-1"
                            title="Tạo hợp đồng"
                          >
                            <FileText size={14} />
                            <span className="text-xs font-medium">Tạo hợp đồng</span>
                          </button>
                        )}

                        {/* 4. CREATED_CONTRACT → Nút "Xem hợp đồng" để upload PDF */}
                        {order.status?.toUpperCase() === 'CREATED_CONTRACT' && order.contractId && (
                          <button
                            onClick={() => navigate(`/evm-staff/contracts/${order.contractId}`)}
                            className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 flex items-center gap-1"
                            title="Xem hợp đồng để upload PDF"
                          >
                            <FileText size={14} />
                            <span className="text-xs font-medium">Upload PDF</span>
                          </button>
                        )}

                        {/* 5. SIGNED_CONTRACT → Nút "Cập nhật → Chờ đặt cọc" */}
                        {order.status?.toUpperCase() === 'SIGNED_CONTRACT' && (
                          <button
                            onClick={() => handleUpdateStatusToAwaitingDeposit(order)}
                            className="text-cyan-600 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors border border-cyan-200 flex items-center gap-1"
                            title="Cập nhật trạng thái sang Chờ đặt cọc"
                          >
                            <CheckCircle size={14} />
                            <span className="text-xs font-medium">→ Chờ đặt cọc</span>
                          </button>
                        )}

                        {/* 6. AWAITING_DEPOSIT → Badge + Nút confirm */}
                        {order.status?.toUpperCase() === 'AWAITING_DEPOSIT' && (
                          <>
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                              <Clock size={14} />
                              <span className="text-xs font-medium">Chờ dealer thanh toán</span>
                            </span>
                            <button
                              onClick={() => handleConfirmDepositReceived(order)}
                              className="text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors border border-teal-200 flex items-center gap-1"
                              title="Xác nhận đã nhận tiền"
                            >
                              <CheckCircle size={14} />
                              <span className="text-xs font-medium">Đã nhận tiền</span>
                            </button>
                          </>
                        )}

                        {/* 7. DEPOSIT_SUCCESS → Nút "Chuẩn bị xe" */}
                        {order.status?.toUpperCase() === 'DEPOSIT_SUCCESS' && (
                          <button
                            onClick={() => handlePrepareVehicle(order)}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 flex items-center gap-1"
                            title="Bắt đầu chuẩn bị xe"
                          >
                            <Car size={14} />
                            <span className="text-xs font-medium">Chuẩn bị xe</span>
                          </button>
                        )}

                        {/* 8. IN_PROGRESS → Nút "Tạo vận chuyển" */}
                        {order.status?.toUpperCase() === 'IN_PROGRESS' && (
                          <button
                            onClick={() => navigate(`/evm-staff/transports?orderId=${order.id}`)}
                            className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-200 flex items-center gap-1"
                            title="Tạo vận chuyển cho đơn hàng này"
                          >
                            <Car size={14} />
                            <span className="text-xs font-medium">Tạo vận chuyển</span>
                          </button>
                        )}

                        {/* 9. IN_TRANSIT → Badge "Đang vận chuyển" */}
                        {order.status?.toUpperCase() === 'IN_TRANSIT' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                            <Car size={14} />
                            <span className="text-xs font-medium">Đang vận chuyển</span>
                          </span>
                        )}

                        {/* Always show View button */}
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
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

      {/* Create Quotation Modal */}
      {showQuotationModal && selectedOrderForQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Plus size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tạo Báo Giá B2B</h3>
                  <p className="text-sm text-gray-500">
                    Đơn hàng: <span className="font-mono font-medium">{selectedOrderForQuotation.code}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQuotationModal(false);
                  setSelectedOrderForQuotation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Thông tin đơn hàng</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Dealer:</span>
                    <p className="font-medium text-blue-900">
                      {selectedOrderForQuotation.dealer?.name || selectedOrderForQuotation.dealerName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Ngày đặt:</span>
                    <p className="font-medium text-blue-900">
                      {selectedOrderForQuotation.createdDate 
                        ? new Date(selectedOrderForQuotation.createdDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700">Loại:</span>
                    <p className="font-medium text-blue-900">
                      Đơn hàng B2B (Dealer đặt xe từ hãng)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Lưu ý:</strong> Bạn sẽ được chuyển đến trang tạo báo giá chi tiết với đầy đủ thông tin đơn hàng.
                  Sau khi tạo báo giá thành công, trạng thái đơn hàng sẽ tự động chuyển sang "Chờ Dealer chấp nhận".
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowQuotationModal(false);
                    setSelectedOrderForQuotation(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateQuotation}
                  className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Tạo Báo Giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showContractModal && selectedOrderForContract && (
        <CreateContractModal
          visible={showContractModal}
          onClose={() => {
            setShowContractModal(false);
            setSelectedOrderForContract(null);
            setSelectedQuotation(null);
          }}
          order={selectedOrderForContract}
          quotation={selectedQuotation}
          onSuccess={handleContractCreated}
        />
      )}

      {/* Create Deposit Modal */}
      {showDepositModal && selectedOrderForDeposit && (
        <CreateDepositModal
          visible={showDepositModal}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedOrderForDeposit(null);
          }}
          order={selectedOrderForDeposit}
          onSuccess={handleDepositCreated}
        />
      )}
    </div>
  );
};

export default EvmStaffOrdersPage;
