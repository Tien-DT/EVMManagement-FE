import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Building, 
  Save, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const DealerContractForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  loading = false,
  dealers = [] 
}) => {
  const [formData, setFormData] = useState({
    dealerId: '',
    contractCode: '',
    terms: '',
    effectiveDate: '',
    expirationDate: '',
    status: 'DRAFT'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        dealerId: initialData.dealerId || '',
        contractCode: initialData.contractCode || '',
        terms: initialData.terms || '',
        effectiveDate: initialData.effectiveDate ? 
          new Date(initialData.effectiveDate).toISOString().split('T')[0] : '',
        expirationDate: initialData.expirationDate ? 
          new Date(initialData.expirationDate).toISOString().split('T')[0] : '',
        status: initialData.status || 'DRAFT'
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dealerId) {
      newErrors.dealerId = 'Vui lòng chọn đại lý';
    }

    if (!formData.contractCode.trim()) {
      newErrors.contractCode = 'Vui lòng nhập mã hợp đồng';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Vui lòng chọn ngày hiệu lực';
    }

    if (!formData.expirationDate) {
      newErrors.expirationDate = 'Vui lòng chọn ngày hết hạn';
    }

    if (formData.effectiveDate && formData.expirationDate) {
      const effectiveDate = new Date(formData.effectiveDate);
      const expirationDate = new Date(formData.expirationDate);
      
      if (expirationDate <= effectiveDate) {
        newErrors.expirationDate = 'Ngày hết hạn phải sau ngày hiệu lực';
      }
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
        ...formData,
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        expirationDate: new Date(formData.expirationDate).toISOString()
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
      contractCode: `CTR-DEALER-${timestamp}`
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                <FileText size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {initialData ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
                </h2>
                <p className="text-sm text-gray-600">
                  {initialData ? 'Cập nhật thông tin hợp đồng đại lý' : 'Tạo hợp đồng cho đại lý'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dealer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Đại lý *
            </label>
            <select
              name="dealerId"
              value={formData.dealerId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.dealerId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Chọn đại lý</option>
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name} - {dealer.email}
                </option>
              ))}
            </select>
            {errors.dealerId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.dealerId}
              </p>
            )}
          </div>

          {/* Contract Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Mã hợp đồng *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="contractCode"
                value={formData.contractCode}
                onChange={handleInputChange}
                placeholder="Nhập mã hợp đồng"
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.contractCode ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={generateContractCode}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Tạo mã
              </button>
            </div>
            {errors.contractCode && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.contractCode}
              </p>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Điều khoản hợp đồng
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              placeholder="Nhập điều khoản hợp đồng..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Ngày hiệu lực *
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.effectiveDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.effectiveDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.effectiveDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Ngày hết hạn *
              </label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.expirationDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.expirationDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.expirationDate}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle size={16} className="inline mr-2" />
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="DRAFT">Bản nháp</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading || isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {initialData ? 'Cập nhật' : 'Tạo hợp đồng'}
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
