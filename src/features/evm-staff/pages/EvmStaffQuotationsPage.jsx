import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  Plus,
  Send
} from 'lucide-react';
import useQuotations from '../hooks/useQuotations';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffQuotationsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { 
    quotations, 
    loading, 
    error, 
    fetchQuotations,
    deleteQuotation 
  } = useQuotations();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'DRAFT': return <FileText size={16} />;
      case 'SENT': return <Clock size={16} />;
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      case 'EXPIRED': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'DRAFT': return 'Bản nháp';
      case 'SENT': return 'Đã gửi';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Bị từ chối';
      case 'EXPIRED': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quotation.status?.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      try {
        await deleteQuotation(id);
        showSuccess('Xóa báo giá thành công!');
      } catch (error) {
        showError(error.message || 'Có lỗi xảy ra khi xóa báo giá');
      }
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/evm-staff/quotations/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Báo Giá</h1>
          <p className="text-gray-500 mt-1">Quản lý báo giá cho các đại lý</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/quotations/create')}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Tạo báo giá
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng báo giá</p>
              <p className="text-2xl font-semibold text-gray-900">{quotations.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <FileText size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Đã gửi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'SENT').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Send size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Đã duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'APPROVED').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bị từ chối</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'REJECTED').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="SENT">Đã gửi</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Quotations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Báo giá
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Đại lý
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quotation.id}</div>
                      {quotation.note && <div className="text-xs text-gray-500 mt-0.5">{quotation.note}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quotation.customerName || quotation.customerId}</div>
                          {quotation.customerEmail && <div className="text-xs text-gray-500">{quotation.customerEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{quotation.dealerName || quotation.dealerId || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.totalValue ? formatCurrency(quotation.totalValue) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {getStatusIcon(quotation.status)}
                        {getStatusText(quotation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        {quotation.createdDate ? new Date(quotation.createdDate).toLocaleDateString('vi-VN') : 
                         quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(quotation.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(quotation.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredQuotations.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 py-16">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Không có báo giá nào</h3>
            <p className="text-gray-500 text-sm">Chưa có báo giá nào được tạo</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffQuotationsPage;

