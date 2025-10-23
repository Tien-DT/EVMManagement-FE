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

const EvmStaffCreateQuotationPage = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [orderRequest, setOrderRequest] = useState(null);
  const [quotationData, setQuotationData] = useState({
    vehicleModel: '',
    vehicleVariant: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    discount: 0,
    finalPrice: 0,
    validUntil: '',
    notes: '',
    terms: ''
  });

  // TODO: Replace with actual API call
  useEffect(() => {
    if (!requestId) return;
    // TODO: Fetch order request details from API using requestId, then setOrderRequest(response)
    setOrderRequest(null);
  }, [requestId]);

  const handleInputChange = (field, value) => {
    setQuotationData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate totals
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        const quantity = field === 'quantity' ? value : updated.quantity;
        const unitPrice = field === 'unitPrice' ? value : updated.unitPrice;
        const discount = field === 'discount' ? value : updated.discount;
        
        const totalPrice = quantity * unitPrice;
        const finalPrice = totalPrice - (totalPrice * discount / 100);
        
        updated.totalPrice = totalPrice;
        updated.finalPrice = finalPrice;
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement actual API call to create quotation
      console.log('Creating quotation:', quotationData);
      showSuccess('Tạo báo giá thành công!');
      navigate('/evm-staff/quotations');
    } catch (error) {
      showError('Có lỗi xảy ra khi tạo báo giá');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!orderRequest) {
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
          onClick={() => navigate('/evm-staff/order-requests')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Tạo báo giá cho yêu cầu #{orderRequest.id}
        </h1>
      </div>

      {/* Order Request Info */}
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

      {/* Quotation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin xe</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mẫu xe
              </label>
              <input
                type="text"
                value={quotationData.vehicleModel}
                onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phiên bản
              </label>
              <input
                type="text"
                value={quotationData.vehicleVariant}
                onChange={(e) => handleInputChange('vehicleVariant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng
              </label>
              <input
                type="number"
                min="1"
                value={quotationData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Báo giá</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn giá (VND)
              </label>
              <input
                type="number"
                min="0"
                value={quotationData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giảm giá (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quotationData.discount}
                onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Có hiệu lực đến
              </label>
              <input
                type="date"
                value={quotationData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tổng kết báo giá</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-medium">{formatCurrency(quotationData.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giảm giá ({quotationData.discount}%):</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(quotationData.totalPrice * quotationData.discount / 100)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Thành tiền:</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(quotationData.finalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={quotationData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Ghi chú thêm về báo giá..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điều khoản
            </label>
            <textarea
              value={quotationData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Điều khoản và điều kiện..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/evm-staff/order-requests')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Tạo báo giá
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvmStaffCreateQuotationPage;
