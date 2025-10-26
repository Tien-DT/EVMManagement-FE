import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import useOrders from '../hooks/useOrders';
import useQuotations from '../hooks/useQuotations';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffOrderFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const isEditMode = Boolean(id);
  
  const { createOrder, updateOrder, getOrderById, loading: orderLoading } = useOrders(false);
  const { quotations } = useQuotations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    code: '',
    quotationId: '',
    customerId: '',
    dealerId: '',
    status: 'CONFIRMED',
    totalAmount: 0,
    discountAmount: 0,
    finalAmount: 0,
    expectedDeliveryAt: '',
    orderType: 'B2C',
    isFinanced: false
  });

  // Fetch order data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchOrderData();
    }
  }, [id, isEditMode]);

  const fetchOrderData = async () => {
    try {
      const response = await getOrderById(id);
      const orderData = response.data || response;
      
      setFormData({
        code: orderData.code || '',
        quotationId: orderData.quotationId || '',
        customerId: orderData.customerId || '',
        dealerId: orderData.dealerId || '',
        status: orderData.status || 'CONFIRMED',
        totalAmount: orderData.totalAmount || 0,
        discountAmount: orderData.discountAmount || 0,
        finalAmount: orderData.finalAmount || 0,
        expectedDeliveryAt: orderData.expectedDeliveryAt ? 
          new Date(orderData.expectedDeliveryAt).toISOString().slice(0, 16) : '',
        orderType: orderData.orderType || 'B2C',
        isFinanced: orderData.isFinanced || false
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      showError('Không thể tải thông tin đơn hàng');
      navigate('/evm-staff/orders');
    }
  };

  // Auto-calculate finalAmount when totalAmount or discountAmount changes
  useEffect(() => {
    const finalAmount = formData.totalAmount - formData.discountAmount;
    if (finalAmount !== formData.finalAmount) {
      setFormData(prev => ({
        ...prev,
        finalAmount: Math.max(0, finalAmount)
      }));
    }
  }, [formData.totalAmount, formData.discountAmount]);

  // Auto-fill customer and dealer from selected quotation
  useEffect(() => {
    if (formData.quotationId && quotations.length > 0) {
      const selectedQuotation = quotations.find(q => q.id === formData.quotationId);
      if (selectedQuotation) {
        setFormData(prev => ({
          ...prev,
          customerId: selectedQuotation.customerId || prev.customerId,
          dealerId: selectedQuotation.dealerId || prev.dealerId,
          totalAmount: selectedQuotation.totalValue || prev.totalAmount
        }));
      }
    }
  }, [formData.quotationId, quotations]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã đơn hàng là bắt buộc';
    }

    if (!formData.quotationId) {
      newErrors.quotationId = 'Báo giá là bắt buộc';
    }

    if (!formData.customerId) {
      newErrors.customerId = 'Khách hàng là bắt buộc';
    }

    if (!formData.status) {
      newErrors.status = 'Trạng thái là bắt buộc';
    }

    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Tổng tiền phải lớn hơn 0';
    }

    if (formData.discountAmount < 0) {
      newErrors.discountAmount = 'Giảm giá không được âm';
    }

    if (formData.finalAmount <= 0) {
      newErrors.finalAmount = 'Thành tiền phải lớn hơn 0';
    }

    if (!formData.expectedDeliveryAt) {
      newErrors.expectedDeliveryAt = 'Ngày giao hàng dự kiến là bắt buộc';
    }

    if (!formData.orderType) {
      newErrors.orderType = 'Loại đơn là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        totalAmount: Number(formData.totalAmount),
        discountAmount: Number(formData.discountAmount),
        finalAmount: Number(formData.finalAmount)
      };

      if (isEditMode) {
        await updateOrder(id, submitData);
        showSuccess('Cập nhật đơn hàng thành công!');
      } else {
        await createOrder(submitData);
        showSuccess('Tạo đơn hàng thành công!');
      }
      navigate('/evm-staff/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evm-staff/orders')}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditMode ? 'Cập nhật thông tin đơn hàng' : 'Điền thông tin để tạo đơn hàng mới'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        {/* Left Column - Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            
            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã đơn hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ORD-2024-001"
                />
                {errors.code && (
                  <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                )}
              </div>

              {/* Quotation Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Báo giá <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.quotationId}
                  onChange={(e) => handleInputChange('quotationId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Chọn báo giá --</option>
                  {quotations.map(quotation => (
                    <option key={quotation.id} value={quotation.id}>
                      {quotation.code || quotation.id} - {quotation.customerName || 'N/A'}
                    </option>
                  ))}
                </select>
                {errors.quotationId && (
                  <p className="text-sm text-red-600 mt-1">{errors.quotationId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại đơn hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => handleInputChange('orderType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="B2C">B2C - Bán lẻ</option>
                    <option value="B2B">B2B - Doanh nghiệp</option>
                  </select>
                  {errors.orderType && (
                    <p className="text-sm text-red-600 mt-1">{errors.orderType}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELED">Đã hủy</option>
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                  )}
                </div>
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày giao hàng dự kiến <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.expectedDeliveryAt}
                  onChange={(e) => handleInputChange('expectedDeliveryAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.expectedDeliveryAt && (
                  <p className="text-sm text-red-600 mt-1">{errors.expectedDeliveryAt}</p>
                )}
              </div>

              {/* Is Financed */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFinanced"
                  checked={formData.isFinanced}
                  onChange={(e) => handleInputChange('isFinanced', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="isFinanced" className="ml-2 block text-sm text-gray-700">
                  Trả góp
                </label>
              </div>
            </div>
          </div>

          {/* Customer & Dealer IDs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên quan</h2>
            
            <div className="space-y-4">
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="UUID của khách hàng"
                  readOnly={Boolean(formData.quotationId)}
                />
                {errors.customerId && (
                  <p className="text-sm text-red-600 mt-1">{errors.customerId}</p>
                )}
                {formData.quotationId && (
                  <p className="text-xs text-gray-500 mt-1">Tự động điền từ báo giá đã chọn</p>
                )}
              </div>

              {/* Dealer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Đại lý
                </label>
                <input
                  type="text"
                  value={formData.dealerId}
                  onChange={(e) => handleInputChange('dealerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="UUID của đại lý (tùy chọn)"
                  readOnly={Boolean(formData.quotationId)}
                />
                {formData.quotationId && (
                  <p className="text-xs text-gray-500 mt-1">Tự động điền từ báo giá đã chọn</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Financial Information */}
        <div className="space-y-6">
          {/* Financial Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết thanh toán</h2>
            
            <div className="space-y-4">
              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tổng tiền <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.totalAmount)} VNĐ
                </p>
                {errors.totalAmount && (
                  <p className="text-sm text-red-600 mt-1">{errors.totalAmount}</p>
                )}
              </div>

              {/* Discount Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm giá
                </label>
                <input
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.discountAmount)} VNĐ
                </p>
                {errors.discountAmount && (
                  <p className="text-sm text-red-600 mt-1">{errors.discountAmount}</p>
                )}
              </div>

              {/* Final Amount (Read-only, calculated) */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành tiền <span className="text-red-500">*</span>
                </label>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(formData.finalAmount)} VNĐ
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tự động tính: Tổng tiền - Giảm giá
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="submit"
                disabled={loading || orderLoading}
                className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditMode ? 'Cập nhật' : 'Tạo đơn hàng'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/evm-staff/orders')}
                disabled={loading || orderLoading}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EvmStaffOrderFormPage;
