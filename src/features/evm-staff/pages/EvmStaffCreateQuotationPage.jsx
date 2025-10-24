import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Send,
  Car,
  User,
  Calculator,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { useCreateQuotation } from '../hooks/useCreateQuotation';
import QuotationDetailForm from '../components/QuotationDetailForm';
import { useAuth } from '../../../hooks/useAuth';

const EvmStaffCreateQuotationPage = () => {
  const navigate = useNavigate();
  const { requestId, id } = useParams();
  const { showSuccess, showError } = useNotification();
  const { createQuotation, updateQuotation, isSubmitting } = useCreateQuotation();
  const { user } = useAuth();
  
  const [orderRequest, setOrderRequest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form data theo format API
  const [formData, setFormData] = useState({
    code: '',
    customerId: '',
    createdByUserId: user?.id || '',
    note: '',
    status: 'DRAFT',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 ngày sau
    quotationDetails: [
      {
        vehicleVariantId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        note: '',
      }
    ]
  });

  // Set user ID when user is loaded
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, createdByUserId: user.id }));
    }
  }, [user]);

  // TODO: Replace with actual API call
  useEffect(() => {
    if (!requestId) return;
    // TODO: Fetch order request details from API using requestId, then setOrderRequest(response)
    setOrderRequest(null);
  }, [requestId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailsChange = (details) => {
    setFormData(prev => ({ ...prev, quotationDetails: details }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.customerId) {
      showError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.quotationDetails.length === 0) {
      showError('Vui lòng thêm ít nhất một chi tiết báo giá');
      return;
    }

    try {
      let result;
      
      if (isEditMode) {
        result = await updateQuotation(id, formData);
      } else {
        result = await createQuotation(formData);
      }
      
      if (result.success) {
        showSuccess(isEditMode ? 'Cập nhật báo giá thành công!' : 'Tạo báo giá thành công!');
        navigate('/evm-staff/quotations');
      } else {
        showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      showError(isEditMode ? 'Có lỗi xảy ra khi cập nhật báo giá' : 'Có lỗi xảy ra khi tạo báo giá');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/evm-staff/quotations')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Chỉnh sửa báo giá' : 'Tạo báo giá mới'}
        </h1>
      </div>

      {/* Order Request Info - Show only if creating from request */}
      {orderRequest && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FileText size={20} className="mr-2" />
            Thông tin yêu cầu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User size={16} className="text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                <strong>Đại lý:</strong> {orderRequest.dealerName}
              </span>
            </div>
            <div className="flex items-center">
              <Car size={16} className="text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                <strong>Xe:</strong> {orderRequest.vehicleModel} - {orderRequest.vehicleVariant}
              </span>
            </div>
            <div className="flex items-center">
              <Calculator size={16} className="text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                <strong>Số lượng:</strong> {orderRequest.quantity}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-blue-800">
                <strong>Ngày yêu cầu:</strong> {new Date(orderRequest.requestedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã báo giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="VD: BG001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerId}
              onChange={(e) => handleInputChange('customerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="UUID của khách hàng"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Có hiệu lực đến <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="DRAFT">Bản nháp</option>
              <option value="SENT">Đã gửi</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>
        </div>

        {/* Quotation Details */}
        <QuotationDetailForm 
          details={formData.quotationDetails} 
          onChange={handleDetailsChange} 
        />

        {/* Additional Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Ghi chú thêm về báo giá..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/evm-staff/quotations')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {isEditMode ? 'Cập nhật báo giá' : 'Tạo báo giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvmStaffCreateQuotationPage;
