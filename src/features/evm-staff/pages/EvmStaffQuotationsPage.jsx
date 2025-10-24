import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Car,
  Plus
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
        showError('Có lỗi xảy ra khi xóa báo giá');
      }
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/evm-staff/quotations/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/evm-staff/quotations/edit/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo Giá</h1>
          <p className="text-gray-600 mt-1">Quản lý báo giá cho các đại lý</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/quotations/create')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Tạo báo giá mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng báo giá</p>
              <p className="text-xl font-bold text-gray-900">{quotations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-xl font-bold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'SENT').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-xl font-bold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Bị từ chối</p>
              <p className="text-xl font-bold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm báo giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã báo giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiệu lực đến
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quotation.code || quotation.id}</div>
                      <div className="text-xs text-gray-500">{quotation.note || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-emerald-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={quotation.customerId}>
                            {quotation.customerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {getStatusIcon(quotation.status)}
                        <span className="ml-1">{getStatusText(quotation.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        {quotation.createdDate ? new Date(quotation.createdDate).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetail(quotation.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(quotation.id)}
                        className="text-emerald-600 hover:text-emerald-900 mr-3"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(quotation.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
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
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có báo giá nào</h3>
          <p className="text-gray-600">Chưa có báo giá nào được tạo</p>
        </div>
      )}
    </div>
  );
};

export default EvmStaffQuotationsPage;

