// src/features/dealer-manager/pages/ReportDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  AlertCircle,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Trash2
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../../dealer-staff/services/orderService';
import { dealerService } from '../services/dealerService';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getReportById, deleteReport, loading } = useReports(false);
  
  const [report, setReport] = useState(null);
  const [order, setOrder] = useState(null);
  const [sender, setSender] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await getReportById(id);
        console.log('📦 Fetched report data:', reportData);
        setReport(reportData);
        
        // Fetch order details if orderId exists
        if (reportData.orderId) {
          try {
            console.log('🔍 Fetching order:', reportData.orderId);
            const orderData = await orderService.getOrderById(reportData.orderId);
            const order = orderData.data || orderData;
            console.log('✅ Order fetched:', order);
            setOrder(order);
          } catch (error) {
            console.error('❌ Error fetching order:', error);
          }
        }

        // Fetch user profile for accountId (sender)
        if (reportData.accountId) {
          try {
            console.log('🔍 Fetching user profile:', reportData.accountId);
            const userProfile = await dealerService.getUserProfile(reportData.accountId);
            console.log('📦 User profile response:', userProfile);
            
            if (userProfile.success && userProfile.data) {
              console.log('✅ User profile data:', userProfile.data);
              setSender(userProfile.data);
            }
          } catch (error) {
            console.error('❌ Error fetching user profile:', error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching report:', error);
        showError('Không thể tải thông tin báo cáo');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc muốn xóa báo cáo này?')) {
      try {
        await deleteReport(id);
        showSuccess('Xóa báo cáo thành công');
        navigate('/dealer-manager/reports');
      } catch (error) {
        showError('Không thể xóa báo cáo');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={16} />;
      case 'PENDING':
        return <Clock size={16} />;
      case 'REJECTED':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'ORDER_ISSUE':
        return 'Lỗi đơn hàng';
      case 'DELIVERY_ISSUE':
        return 'Lỗi giao hàng';
      case 'VEHICLE_ISSUE':
        return 'Lỗi xe';
      case 'OTHER':
        return 'Khác';
      default:
        return type;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <p className="text-red-800">Không tìm thấy báo cáo</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết Báo cáo</h1>
            <p className="text-gray-600 mt-1">Thông tin chi tiết báo cáo đã gửi</p>
          </div>
        </div>

        {/* Report Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thông tin Báo cáo</h2>
              <p className="text-gray-500 text-sm mt-1">ID: {report.id}</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(report.status)}`}>
              {getStatusIcon(report.status)}
              <span className="ml-2">{getStatusText(report.status)}</span>
            </span>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FileText size={20} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tiêu đề</p>
                  <p className="text-lg font-semibold text-gray-900">{report.title}</p>
                </div>
              </div>
            </div>

            {/* Type & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại báo cáo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getTypeText(report.type)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reported By */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Người gửi</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {sender 
                        ? (sender.fullName || sender.name || sender.email || 'N/A')
                        : report.accountId 
                        ? `${report.accountId.slice(0, 8)}...`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Nội dung báo cáo</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.content}</p>
                </div>
              </div>
            </div>

            {/* Related Order */}
            {report.orderId && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Đơn hàng liên quan</p>
                    {order ? (
                      <p className="text-sm font-semibold text-gray-900">
                        {order.code || order.id}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">{report.orderId}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium">Ngày gửi:</span>
                <span>
                  {report.createdAt 
                    ? new Date(report.createdAt).toLocaleString('vi-VN') 
                    : report.createdDate 
                    ? new Date(report.createdDate).toLocaleString('vi-VN')
                    : 'N/A'}
                </span>
              </div>
              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="font-medium">Ngày cập nhật:</span>
                  <span>{new Date(report.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={() => navigate('/dealer-manager/reports')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;

