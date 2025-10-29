// src/features/dealer-manager/pages/DepositDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import { useDeposits } from '../hooks/useDeposits';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../../dealer-staff/services/orderService';
import { dealerService } from '../services/dealerService';

const DepositDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getDepositById, deleteDeposit, loading } = useDeposits(false);
  
  const [deposit, setDeposit] = useState(null);
  const [order, setOrder] = useState(null);
  const [createdByUser, setCreatedByUser] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const depositData = await getDepositById(id);
        console.log('📦 Fetched deposit data:', depositData);
        setDeposit(depositData);
        
        // Fetch order details if orderId exists
        if (depositData.orderId) {
          try {
            console.log('🔍 Fetching order:', depositData.orderId);
            const orderData = await orderService.getOrderById(depositData.orderId);
            const order = orderData.data || orderData;
            console.log('✅ Order fetched:', order);
            setOrder(order);
          } catch (error) {
            console.error('❌ Error fetching order:', error);
          }
        }

        // Fetch user profile for receivedByUserId
        if (depositData.receivedByUserId) {
          try {
            console.log('🔍 Fetching user profile:', depositData.receivedByUserId);
            const userProfile = await dealerService.getUserProfile(depositData.receivedByUserId);
            console.log('📦 User profile response:', userProfile);
            
            if (userProfile.success && userProfile.data) {
              console.log('✅ User profile data:', userProfile.data);
              setCreatedByUser(userProfile.data);
            }
          } catch (error) {
            console.error('❌ Error fetching user profile:', error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching deposit:', error);
        showError('Không thể tải thông tin deposit');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc muốn xóa deposit này?')) {
      try {
        await deleteDeposit(id);
        showSuccess('Xóa deposit thành công');
        navigate('/dealer-manager/deposits');
      } catch (error) {
        showError('Không thể xóa deposit');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={16} />;
      case 'PENDING':
        return <Clock size={16} />;
      case 'REJECTED':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'CASH':
        return 'Tiền mặt';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      default:
        return method;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <p className="text-red-800">Không tìm thấy deposit</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dealer-manager/deposits')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết Deposit</h1>
            <p className="text-gray-600 mt-1">Thông tin chi tiết về tiền cọc</p>
          </div>
        </div>

        {/* Deposit Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thông tin Deposit</h2>
              <p className="text-gray-500 text-sm mt-1">ID: {deposit.id}</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(deposit.status)}`}>
              {getStatusIcon(deposit.status)}
              <span className="ml-2">{getStatusText(deposit.status)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <DollarSign size={20} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số tiền (VNĐ)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deposit.amount?.toLocaleString('vi-VN') || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getMethodText(deposit.method)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Đơn hàng</p>
                  {order ? (
                    <p className="text-sm font-semibold text-gray-900">
                      {order.code || order.id}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">N/A</p>
                  )}
                </div>
              </div>
            </div>

            {/* Created By */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Người nhận</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {createdByUser 
                      ? (createdByUser.fullName || createdByUser.name || createdByUser.email || 'N/A')
                      : deposit.receivedByUserId 
                      ? `${deposit.receivedByUserId.slice(0, 8)}...`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            {deposit.note && (
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú</p>
                    <p className="text-sm text-gray-600">{deposit.note}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="md:col-span-2 border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium">Ngày gửi:</span>
                <span>
                  {deposit.createdAt 
                    ? new Date(deposit.createdAt).toLocaleString('vi-VN') 
                    : deposit.createdDate 
                    ? new Date(deposit.createdDate).toLocaleString('vi-VN')
                    : 'N/A'}
                </span>
              </div>
              {deposit.updatedAt && deposit.updatedAt !== deposit.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="font-medium">Ngày cập nhật:</span>
                  <span>{new Date(deposit.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={() => navigate('/dealer-manager/deposits')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositDetailPage;
