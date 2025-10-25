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
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <div className="p-3 bg-white/20 rounded-lg mr-4 backdrop-blur-sm">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {initialData ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
                </h2>
                <p className="text-purple-100">
                  {initialData ? 'Cập nhật thông tin hợp đồng' : 'Tạo hợp đồng cho đơn hàng'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Contract Code */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <div className="p-1.5 bg-indigo-100 rounded-lg mr-2 group-hover:bg-indigo-200 transition-colors">
                <FileText size={16} className="text-indigo-600" />
              </div>
              Mã hợp đồng *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Nhập mã hợp đồng"
                className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  errors.code ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={generateContractCode}
                className="px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-indigo-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                disabled={loading}
              >
                Tạo mã
              </button>
            </div>
            {errors.code && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.code}
              </p>
            )}
          </div>

          {/* Order and Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Selection */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <div className="p-1.5 bg-blue-100 rounded-lg mr-2 group-hover:bg-blue-200 transition-colors">
                  <Package size={16} className="text-blue-600" />
                </div>
                Đơn hàng *
              </label>
              <select
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  errors.orderId ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.orderId}
                </p>
              )}
            </div>

            {/* Customer Selection */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <div className="p-1.5 bg-purple-100 rounded-lg mr-2 group-hover:bg-purple-200 transition-colors">
                  <User size={16} className="text-purple-600" />
                </div>
                Khách hàng *
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  errors.customerId ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.customerId}
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <div className="p-1.5 bg-emerald-100 rounded-lg mr-2 group-hover:bg-emerald-200 transition-colors">
                <FileText size={16} className="text-emerald-600" />
              </div>
              Điều khoản hợp đồng *
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              placeholder="Nhập các điều khoản và điều kiện của hợp đồng..."
              rows={5}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-all duration-200 resize-none ${
                errors.terms ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              disabled={loading}
            />
            {errors.terms && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.terms}
              </p>
            )}
          </div>

          {/* Signed At & Contract Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <div className="p-1.5 bg-green-100 rounded-lg mr-2 group-hover:bg-green-200 transition-colors">
                  <Calendar size={16} className="text-green-600" />
                </div>
                Ngày ký
              </label>
              <input
                type="datetime-local"
                name="signedAt"
                value={formData.signedAt}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-all duration-200"
                disabled={loading}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <div className="p-1.5 bg-cyan-100 rounded-lg mr-2 group-hover:bg-cyan-200 transition-colors">
                  <LinkIcon size={16} className="text-cyan-600" />
                </div>
                Link hợp đồng
              </label>
              <input
                type="url"
                name="contractLink"
                value={formData.contractLink}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          {/* Status */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <div className="p-1.5 bg-yellow-100 rounded-lg mr-2 group-hover:bg-yellow-200 transition-colors">
                <CheckCircle size={16} className="text-yellow-600" />
              </div>
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-all duration-200"
              disabled={loading}
            >
              <option value="DRAFT">📝 Bản nháp</option>
              <option value="PENDING_SIGNATURE">✍️ Chờ ký</option>
              <option value="ACTIVE">✓ Đang hoạt động</option>
              <option value="CANCELED">❌ Đã hủy</option>
            </select>
          </div>

          {/* Actions with Gradient Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center font-semibold hover:scale-105"
              disabled={loading || isSubmitting}
            >
              <X size={18} className="mr-2" />
              Hủy
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {initialData ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerContractForm;
