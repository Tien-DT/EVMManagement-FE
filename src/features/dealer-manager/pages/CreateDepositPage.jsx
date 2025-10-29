// src/features/dealer-manager/pages/CreateDepositPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Save, DollarSign, AlertCircle } from 'lucide-react';
import { useDeposits } from '../hooks/useDeposits';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../hooks/useAuth';
import orderService from '../../dealer-staff/services/orderService';

const CreateDepositPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { createDeposit, loading } = useDeposits(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    method: 'CASH',
    status: 'PENDING',
    receivedByUserId: user?.id || '',
    note: '',
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getAllOrders({ pageNumber: 1, pageSize: 1000 });
        const data = response?.data?.items || response?.items || [];
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showError('Không thể tải danh sách đơn hàng');
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.orderId) newErrors.orderId = 'Đơn hàng là bắt buộc';
    if (!formData.amount) {
      newErrors.amount = 'Số tiền là bắt buộc';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Số tiền phải là số lớn hơn 0';
      }
    }
    if (!user?.id) {
      newErrors.general = 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare deposit data according to API spec
    const depositData = {
      orderId: formData.orderId,
      amount: parseFloat(formData.amount),
      method: formData.method,
      status: formData.status,
      receivedByUserId: user?.id || formData.receivedByUserId,
      ...(formData.note && formData.note.trim() && { note: formData.note }),
    };

    console.log('Submitting deposit data:', depositData);

    try {
      await createDeposit(depositData);
      showSuccess('Tạo deposit thành công');
      navigate('/dealer-manager/deposits');
    } catch (error) {
      console.error('Deposit creation error:', error);
      showError(error.response?.data?.message || 'Không thể tạo deposit');
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Tạo tiền cọc mới</h1>
            <p className="text-gray-600 mt-1">Tạo deposit cho đơn hàng</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          {/* Order Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn hàng <span className="text-red-500">*</span>
            </label>
            {loadingOrders ? (
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-500">Đang tải danh sách đơn hàng...</span>
              </div>
            ) : (
              <select
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                className={`w-full px-4 py-2 border ${
                  errors.orderId ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              >
                <option value="">Chọn đơn hàng...</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.code || order.id.slice(-12)} - {order.customerName || 'N/A'}
                  </option>
                ))}
              </select>
            )}
            {errors.orderId && <p className="text-red-500 text-sm mt-1">{errors.orderId}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Nhập số tiền..."
                step="0.01"
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức thanh toán <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="CASH">Tiền mặt</option>
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="CREDIT_CARD">Thẻ tín dụng</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Nhập ghi chú (nếu có)..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {/* <div className="text-xs text-gray-400 space-y-1">
            <p>OrderID: {formData.orderId || 'NOT SET'}</p>
            <p>Amount: {formData.amount || 'NOT SET'}</p>
            <p>UserID: {user?.id || 'NOT SET'}</p>
          </div> */}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dealer-manager/deposits')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={20} />
                  Tạo deposit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepositPage;

