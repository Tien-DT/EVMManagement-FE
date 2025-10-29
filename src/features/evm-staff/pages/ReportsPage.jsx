// src/features/evm-staff/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useNotification } from '../../../context/NotificationContext';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { reports, loading, error, fetchReports, approveReport, rejectReport } = useReports(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReports({ pageNumber: 1, pageSize: 50 });
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc muốn duyệt báo cáo này?')) {
      try {
        await approveReport(id);
        showSuccess('Duyệt báo cáo thành công');
      } catch (error) {
        showError('Không thể duyệt báo cáo');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Lý do từ chối:');
    if (reason && window.confirm('Bạn có chắc muốn từ chối báo cáo này?')) {
      try {
        await rejectReport(id, reason);
        showSuccess('Từ chối báo cáo thành công');
      } catch (error) {
        showError('Không thể từ chối báo cáo');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối', icon: XCircle },
    };
    const config = statusMap[status] || statusMap.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      ORDER_ISSUE: 'Lỗi đơn hàng',
      DELIVERY_ISSUE: 'Lỗi giao hàng',
      VEHICLE_ISSUE: 'Lỗi xe',
      OTHER: 'Khác',
    };
    return typeMap[type] || type;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nhận báo cáo từ Dealer</h1>
        <p className="text-gray-600 mt-1">Quản lý các báo cáo từ Dealer Managers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">Chưa có báo cáo nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{report.content}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Loại: {getTypeLabel(report.type)}</span>
                    {report.orderId && <span>Order: {report.orderId.slice(-8)}</span>}
                    {report.dealerId && <span>Dealer: {report.dealerId.slice(-8)}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/evm-staff/reports/${report.id}`)}
                    className="px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(report.id)}
                        className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

