import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Package,
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';

const DealerContractForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  loading = false,
  orders = [],
  customers = []
}) => {
  const [formData, setFormData] = useState({
    code: '',
    orderId: '',
    customerId: '',
    terms: '',
    status: 'DRAFT',
    signedAt: '',
    contractLink: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        orderId: initialData.orderId || '',
        customerId: initialData.customerId || '',
        terms: initialData.terms || '',
        status: initialData.status || 'DRAFT',
        signedAt: initialData.signedAt ? 
          new Date(initialData.signedAt).toISOString().split('T')[0] + 'T' + 
          new Date(initialData.signedAt).toISOString().split('T')[1].substring(0, 5) : '',
        contractLink: initialData.contractLink || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã hợp đồng';
    }

    if (!formData.orderId) {
      newErrors.orderId = 'Vui lòng chọn đơn hàng';
    }

    if (!formData.customerId) {
      newErrors.customerId = 'Vui lòng chọn khách hàng';
    }

    if (!formData.terms.trim()) {
      newErrors.terms = 'Vui lòng nhập điều khoản hợp đồng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        code: formData.code,
        orderId: formData.orderId,
        customerId: formData.customerId,
        terms: formData.terms,
        status: formData.status,
        ...(formData.signedAt && { signedAt: new Date(formData.signedAt).toISOString() }),
        ...(formData.contractLink && { contractLink: formData.contractLink })
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateContractCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
    setFormData(prev => ({
      ...prev,
      code: `CTR-${timestamp}-${randomCode}`
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-lg">
              <FileText size={20} className="text-gray-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? 'Chỉnh sửa hợp đồng' : 'Thông tin hợp đồng'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {initialData ? 'Cập nhật thông tin hợp đồng' : 'Nhập đầy đủ thông tin bên dưới'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Contract Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã hợp đồng <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Nhập mã hợp đồng"
              className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm ${
                errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={generateContractCode}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              disabled={loading}
            >
              Tạo mã
            </button>
          </div>
          {errors.code && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.code}
            </p>
          )}
        </div>

        {/* Order and Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Order Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn hàng <span className="text-red-500">*</span>
            </label>
            <select
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm ${
                errors.orderId ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Chọn đơn hàng ({orders.length} đơn)</option>
              {orders.length === 0 ? (
                <option disabled>Không có đơn hàng nào</option>
              ) : (
                orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderCode || order.code || `Đơn hàng ${order.id?.substring(0, 8)}...`}
                    {order.customerId && ` - KH: ${order.customerId.substring(0, 8)}...`}
                  </option>
                ))
              )}
            </select>
            {errors.orderId && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.orderId}
              </p>
            )}
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách hàng <span className="text-red-500">*</span>
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm ${
                errors.customerId ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Chọn khách hàng ({customers.length} khách hàng)</option>
              {customers.length === 0 ? (
                <option disabled>Không có khách hàng nào</option>
              ) : (
                customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName || customer.name || customer.customerName || `Khách hàng ${customer.id?.substring(0, 8)}...`}
                    {customer.phoneNumber && ` - ${customer.phoneNumber}`}
                    {customer.phone && ` - ${customer.phone}`}
                  </option>
                ))
              )}
            </select>
            {errors.customerId && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.customerId}
              </p>
            )}
          </div>
        </div>

        {/* Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Điều khoản hợp đồng <span className="text-red-500">*</span>
          </label>
          <textarea
            name="terms"
            value={formData.terms}
            onChange={handleInputChange}
            placeholder="Nhập các điều khoản và điều kiện của hợp đồng..."
            rows={6}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm resize-none ${
              errors.terms ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.terms && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.terms}
            </p>
          )}
        </div>

        {/* Signed At & Contract Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày ký
            </label>
            <input
              type="datetime-local"
              name="signedAt"
              value={formData.signedAt}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link hợp đồng
            </label>
            <input
              type="url"
              name="contractLink"
              value={formData.contractLink}
              onChange={handleInputChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
            disabled={loading}
          >
            <option value="DRAFT">Bản nháp</option>
            <option value="PENDING_SIGNATURE">Chờ ký</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="CANCELED">Đã hủy</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
            disabled={loading || isSubmitting}
          >
            <X size={18} />
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save size={18} />
                {initialData ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealerContractForm;
