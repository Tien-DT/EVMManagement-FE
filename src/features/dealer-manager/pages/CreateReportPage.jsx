// src/features/dealer-manager/pages/CreateReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save, AlertCircle } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../hooks/useAuth';

const CreateReportPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { createReport } = useReports(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'ORDER_ISSUE',
    orderId: null,
    dealerId: '',
    accountId: user?.id || '',
  });

  const [errors, setErrors] = useState({});

  // Get dealerId from user profile
  useEffect(() => {
    const fetchDealerId = async () => {
      if (!user?.id) {
        console.error('❌ No user found');
        return;
      }

      try {
        // 1. Check if dealerId is already cached
        const cachedDealerId = sessionStorage.getItem('dealerId');
        if (cachedDealerId) {
          console.log('✅ Using cached dealerId:', cachedDealerId);
          setFormData(prev => ({ ...prev, dealerId: cachedDealerId }));
          return;
        }

        // 2. Check userProfile in sessionStorage
        const userProfileStr = sessionStorage.getItem('userProfile');
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          if (userProfile.dealerId) {
            console.log('✅ DealerId from userProfile:', userProfile.dealerId);
            sessionStorage.setItem('dealerId', userProfile.dealerId);
            setFormData(prev => ({ ...prev, dealerId: userProfile.dealerId }));
            return;
          }
        }

        // 3. Fetch from API
        console.log('🔍 Fetching dealerId from API for accountId:', user.id);
        
        const { dealerService } = await import('../services/dealerService');
        const userProfile = await dealerService.getUserProfile(user.id);
        
        console.log('📦 User profile response:', userProfile);

        if (userProfile.success && userProfile.data?.dealerId) {
          const fetchedDealerId = userProfile.data.dealerId;
          console.log('✅ DealerId fetched from API:', fetchedDealerId);

          // Save to sessionStorage for future use
          sessionStorage.setItem('userProfile', JSON.stringify(userProfile.data));
          sessionStorage.setItem('dealerId', fetchedDealerId);
          
          setFormData(prev => ({ ...prev, dealerId: fetchedDealerId }));
        } else {
          console.error('❌ No dealerId found in user profile');
          console.error('Profile data:', userProfile);
        }
      } catch (error) {
        console.error('❌ Error fetching dealerId:', error);
      }
    };
    
    fetchDealerId();
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
    if (!formData.content.trim()) newErrors.content = 'Nội dung là bắt buộc';
    if (!formData.accountId) {
      newErrors.general = 'Vui lòng đăng nhập lại';
    }
    if (!formData.dealerId) {
      newErrors.general = 'Không tìm thấy thông tin Dealer. Vui lòng đăng nhập lại.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare data - only send non-empty orderId
    const reportData = {
      accountId: formData.accountId,
      dealerId: formData.dealerId,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      ...(formData.orderId && formData.orderId.trim() && { orderId: formData.orderId }),
    };

    console.log('Submitting report data:', reportData);

    try {
      await createReport(reportData);
      showSuccess('Gửi báo cáo thành công');
      navigate('/dealer-manager/reports');
    } catch (error) {
      console.error('Report creation error:', error);
      showError(error.response?.data?.message || 'Không thể gửi báo cáo');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dealer-manager/reports')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo báo cáo mới</h1>
            <p className="text-gray-600 mt-1">Gửi báo cáo lên EVM Staff</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại báo cáo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="ORDER_ISSUE">Lỗi đơn hàng</option>
              <option value="DELIVERY_ISSUE">Lỗi giao hàng</option>
              <option value="VEHICLE_ISSUE">Lỗi xe</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề báo cáo..."
              className={`w-full px-4 py-2 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Mô tả chi tiết vấn đề..."
              rows={8}
              className={`w-full px-4 py-2 border ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          {/* Order ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã đơn hàng (nếu có)
            </label>
            <input
              type="text"
              value={formData.orderId || ''}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value || null })}
              placeholder="Nhập ID đơn hàng (UUID)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Để trống nếu không có đơn hàng liên quan
            </p>
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
            <p>AccountID: {formData.accountId || 'NOT SET'}</p>
            <p>DealerID: {formData.dealerId || 'NOT SET'}</p>
          </div> */}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dealer-manager/reports')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Gửi báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportPage;

