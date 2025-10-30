import React, { useState, useEffect } from 'react';
import { XCircle, Package, MapPin, Hash } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const CreateWarehouseModal = ({ visible, warehouse, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: 0,
    type: 'EVM',
    dealerId: null
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        address: warehouse.address || '',
        capacity: warehouse.capacity || 0,
        type: warehouse.type || 'EVM',
        dealerId: warehouse.dealerId || null
      });
    } else {
      setFormData({
        name: '',
        address: '',
        capacity: 0,
        type: 'EVM',
        dealerId: null
      });
    }
  }, [warehouse]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên kho');
      return;
    }
    if (!formData.address.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return;
    }
    if (formData.capacity <= 0) {
      alert('Sức chứa phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        capacity: parseInt(formData.capacity),
        type: formData.type,
        dealerId: null // Admin tạo warehouse EVM không có dealerId
      };

      console.log('Creating/Updating warehouse with payload:', payload);

      if (warehouse) {
        // Update existing warehouse
        await axiosInstance.put(endpoints.warehouses.update(warehouse.id), payload);
        alert('Cập nhật kho thành công!');
      } else {
        // Create new warehouse
        await axiosInstance.post(endpoints.warehouses.create, payload);
        alert('Tạo kho thành công!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      console.error('Error response:', error.response?.data);
      alert('Lỗi khi lưu kho: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {warehouse ? 'Chỉnh sửa kho' : 'Tạo kho mới'}
              </h3>
              <p className="text-sm text-gray-500">
                {warehouse ? 'Cập nhật thông tin kho hàng' : 'Thêm kho hàng mới vào hệ thống'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên kho <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VD: Kho trung tâm Hà Nội"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="VD: 123 Đường ABC, Quận XYZ, Hà Nội"
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sức chứa (số xe) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="VD: 100"
                min="1"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Số lượng xe tối đa có thể chứa trong kho</p>
          </div>

          {/* Type - Read-only for admin (always EVM) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại kho
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm font-medium text-blue-800">EVM</span>
              <p className="text-xs text-blue-600 mt-1">Kho trung tâm của EVM (không thuộc dealer)</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li>Kho EVM là kho trung tâm quản lý bởi hệ thống</li>
              <li>Dealer không thể truy cập hoặc quản lý kho EVM</li>
              <li>Kho Dealer được tạo tự động khi dealer đăng ký</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Package size={16} />
                  <span>{warehouse ? 'Cập nhật' : 'Tạo kho'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWarehouseModal;
