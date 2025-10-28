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
  Upload
} from 'lucide-react';
import FileUpload from '../../../components/FileUpload';

const DealerContractForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  loading = false,
  dealers = []
}) => {
  const [formData, setFormData] = useState({
    contractCode: '',
    dealerId: '',
    terms: '',
    status: 'DRAFT',
    effectiveDate: '',
    expirationDate: '',
    contractLink: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        contractCode: initialData.contractCode || initialData.code || '',
        dealerId: initialData.dealerId || '',
        terms: initialData.terms || '',
        status: initialData.status || 'DRAFT',
        effectiveDate: initialData.effectiveDate ? 
          new Date(initialData.effectiveDate).toISOString().split('T')[0] + 'T' + 
          new Date(initialData.effectiveDate).toISOString().split('T')[1].substring(0, 5) : '',
        expirationDate: initialData.expirationDate ? 
          new Date(initialData.expirationDate).toISOString().split('T')[0] + 'T' + 
          new Date(initialData.expirationDate).toISOString().split('T')[1].substring(0, 5) : '',
        contractLink: initialData.contractLink || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contractCode.trim()) {
      newErrors.contractCode = 'Vui lòng nhập mã hợp đồng';
    }

    if (!formData.dealerId) {
      newErrors.dealerId = 'Vui lòng chọn Dealer';
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
        contractCode: formData.contractCode,
        dealerId: formData.dealerId,
        terms: formData.terms,
        status: formData.status,
        ...(formData.effectiveDate && { effectiveDate: new Date(formData.effectiveDate).toISOString() }),
        ...(formData.expirationDate && { expirationDate: new Date(formData.expirationDate).toISOString() }),
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
      contractCode: `CTR-${timestamp}-${randomCode}`
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
              name="contractCode"
              value={formData.contractCode}
              onChange={handleInputChange}
              placeholder="Nhập mã hợp đồng"
              className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm ${
                errors.contractCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
          {errors.contractCode && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.contractCode}
            </p>
          )}
        </div>

        {/* Dealer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dealer <span className="text-red-500">*</span>
          </label>
          <select
            name="dealerId"
            value={formData.dealerId}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm ${
              errors.dealerId ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Chọn Dealer ({dealers.length} dealers)</option>
            {dealers.length === 0 ? (
              <option disabled>Không có dealer nào</option>
            ) : (
              dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.dealerName || dealer.name || `Dealer ${dealer.id?.substring(0, 8)}...`}
                  {dealer.address && ` - ${dealer.address}`}
                  {dealer.phoneNumber && ` - ${dealer.phoneNumber}`}
                </option>
              ))
            )}
          </select>
          {errors.dealerId && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.dealerId}
            </p>
          )}
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

        {/* Effective Date & Expiration Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày hiệu lực
            </label>
            <input
              type="datetime-local"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày hết hạn
            </label>
            <input
              type="datetime-local"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {/* Contract Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Upload size={16} />
            File hợp đồng
          </label>
          <FileUpload
            onUploadComplete={(url) => {
              setFormData(prev => ({
                ...prev,
                contractLink: url
              }));
            }}
          />
          {formData.contractLink && (
            <div className="mt-2">
              <a 
                href={formData.contractLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
              >
                <FileText size={14} />
                Xem file đã upload
              </a>
            </div>
          )}
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

