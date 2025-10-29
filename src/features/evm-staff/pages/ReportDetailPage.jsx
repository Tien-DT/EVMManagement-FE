// src/features/evm-staff/pages/ReportDetailPage.jsx
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
  Trash2,
  UserCheck,
  Send,
  Building2
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../services/orderService';
import { dealerService } from '../../dealer-manager/services/dealerService';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getReportById, approveReport, rejectReport, loading } = useReports(false);
  
  const [report, setReport] = useState(null);
  const [order, setOrder] = useState(null);
  const [sender, setSender] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await getReportById(id);
        console.log('📦 Fetched report data:', reportData);
        console.log('📊 Report status:', reportData.status);
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
            console.log('🔍 Fetching sender profile:', reportData.accountId);
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

  const handleApprove = async () => {
    if (!window.confirm('Bạn có chắc muốn duyệt báo cáo này?')) {
      return;
    }
    
    try {
      console.log('✅ Approving report:', id, 'with notes:', actionNotes);
      await approveReport(id, actionNotes || null);
      showSuccess('Duyệt báo cáo thành công');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/evm-staff/reports');
      }, 1000);
    } catch (error) {
      console.error('❌ Error approving report:', error);
      showError(error.response?.data?.message || 'Không thể duyệt báo cáo');
    }
  };

  const handleReject = async () => {
    if (!actionNotes.trim()) {
      showError('Vui lòng nhập lý do từ chối');
      return;
    }
    
    if (!window.confirm('Bạn có chắc muốn từ chối báo cáo này?')) {
      return;
    }
    
    try {
      console.log('❌ Rejecting report:', id, 'with reason:', actionNotes);
      await rejectReport(id, actionNotes);
      showSuccess('Từ chối báo cáo thành công');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/evm-staff/reports');
      }, 1000);
    } catch (error) {
      console.error('❌ Error rejecting report:', error);
      showError(error.response?.data?.message || 'Không thể từ chối báo cáo');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/evm-staff/reports')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Báo cáo</h1>
            <p className="text-gray-600 mt-0.5">ID: {report.id.slice(0, 8)}...</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(report.status)}`}>
          {getStatusIcon(report.status)}
          <span className="ml-2">{getStatusText(report.status)}</span>
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Report Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Title & Type */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={18} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tiêu đề</p>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
          </div>

          {/* Type & Sender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-blue-500" />
                <p className="text-xs text-gray-600">Loại</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{getTypeText(report.type)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-purple-500" />
                <p className="text-xs text-gray-600">Người gửi</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {sender 
                  ? (sender.fullName || sender.name || sender.email || 'N/A')
                  : report.accountId 
                  ? `${report.accountId.slice(0, 8)}...`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nội dung</p>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.content}</p>
          </div>

          {/* Related Order */}
          {report.orderId && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-blue-500" />
                <p className="text-xs font-medium text-gray-700">Đơn hàng liên quan</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {order ? (order.code || order.id) : report.orderId}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar size={14} className="text-gray-400" />
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
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span className="font-medium">Cập nhật:</span>
                <span>{new Date(report.updatedAt).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Card - Only for PENDING reports */}
          {report.status === 'PENDING' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck size={18} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Xử lý báo cáo</h3>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Nhập lý do duyệt/từ chối..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Từ chối
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-green-500 text-white text-sm rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Duyệt
                </button>
              </div>
            </div>
          )}

          {/* Result Card - For processed reports (APPROVED/REJECTED) */}
          {report.status !== 'PENDING' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck size={18} className={report.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'} />
                <h3 className="text-sm font-semibold text-gray-900">Kết quả xử lý</h3>
              </div>
              
              <div className={`p-4 rounded-lg ${report.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {report.status === 'APPROVED' ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <XCircle size={20} className="text-red-600" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {report.status === 'APPROVED' ? 'Đã chấp nhận' : 'Đã từ chối'}
                  </span>
                </div>
                
                {report.updatedAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium">Thời gian:</span>
                    <span>{new Date(report.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => navigate('/evm-staff/reports')}
              className="w-full px-4 py-2.5 border border-gray-300 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Trạng thái</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  <span className="ml-1">{getStatusText(report.status)}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Loại</span>
                <span className="text-sm font-medium text-gray-900">{getTypeText(report.type)}</span>
              </div>
              {report.orderId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Order</span>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {order ? (order.code || order.id) : report.orderId.slice(0, 8)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;

