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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evm-staff/quotations')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {isEditMode ? 'Chỉnh Sửa Báo Giá' : 'Tạo Báo Giá Mới'}
          </h1>
          <p className="text-gray-500 mt-1">Nhập thông tin báo giá cho khách hàng</p>
        </div>
      </div>

      {/* Order Request Info - Show only if creating from request */}
      {orderRequest && (
        <div className="bg-white border border-blue-200 rounded-lg p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Thông tin yêu cầu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                <span className="font-medium">Đại lý:</span> {orderRequest.dealerName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Car size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                <span className="font-medium">Xe:</span> {orderRequest.vehicleModel} - {orderRequest.vehicleVariant}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                <span className="font-medium">Số lượng:</span> {orderRequest.quantity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                <span className="font-medium">Ngày yêu cầu:</span> {new Date(orderRequest.requestedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã báo giá <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                placeholder="VD: BG001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                placeholder="UUID của khách hàng"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Có hiệu lực đến <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="SENT">Đã gửi</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <QuotationDetailForm 
          details={formData.quotationDetails} 
          onChange={handleDetailsChange} 
        />

        {/* Additional Info */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Thông tin bổ sung</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              placeholder="Ghi chú thêm về báo giá..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/evm-staff/quotations')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditMode ? 'Cập nhật báo giá' : 'Tạo báo giá'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvmStaffCreateQuotationPage;
