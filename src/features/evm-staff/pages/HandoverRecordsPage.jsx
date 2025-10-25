// src/features/evm-staff/pages/HandoverRecordsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Package,
  Car,
  AlertCircle,
  Plus
} from 'lucide-react';
import useHandoverRecords from '../hooks/useHandoverRecords';
import { useNotification } from '../../../context/NotificationContext';

const HandoverRecordsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    handoverRecords, 
    loading, 
    error, 
    pagination,
    fetchHandoverRecords,
    deleteHandoverRecord,
    updateHandoverRecordStatus
  } = useHandoverRecords();

  const getStatusColor = (isAccepted) => {
    return isAccepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (isAccepted) => {
    return isAccepted ? <CheckCircle size={16} /> : <Clock size={16} />;
  };

  const getStatusText = (isAccepted) => {
    return isAccepted ? 'Đã chấp nhận' : 'Chờ xác nhận';
  };

  const filteredRecords = handoverRecords.filter(record => {
    const matchesSearch = record.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'accepted' && record.isAccepted) ||
                         (filterStatus === 'pending' && !record.isAccepted);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi bàn giao này?')) {
      try {
        await deleteHandoverRecord(id);
        showSuccess('Xóa bản ghi bàn giao thành công!');
      } catch (error) {
        showError(error.message || 'Có lỗi xảy ra khi xóa bản ghi bàn giao');
      }
    }
  };

  const handleUpdateStatus = async (id, isAccepted) => {
    const action = isAccepted ? 'chấp nhận' : 'từ chối';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} bàn giao này?`)) {
      try {
        await updateHandoverRecordStatus(id, isAccepted);
        showSuccess(`${isAccepted ? 'Chấp nhận' : 'Từ chối'} bàn giao thành công!`);
      } catch (error) {
        showError(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/evm-staff/handover-records/${id}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchHandoverRecords({ pageNumber: newPage, pageSize: pagination.pageSize });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Bàn Giao Xe</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý quá trình bàn giao xe điện</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/handover-records/create')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Tạo bàn giao mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng bàn giao</p>
              <p className="text-xl font-bold text-gray-900">{handoverRecords.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đã chấp nhận</p>
              <p className="text-xl font-bold text-gray-900">
                {handoverRecords.filter(r => r.isAccepted).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chờ xác nhận</p>
              <p className="text-xl font-bold text-gray-900">
                {handoverRecords.filter(r => !r.isAccepted).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package size={20} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tháng này</p>
              <p className="text-xl font-bold text-gray-900">
                {handoverRecords.filter(r => {
                  const recordDate = new Date(r.handoverDate);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, đơn hàng, xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="accepted">Đã chấp nhận</option>
              <option value="pending">Chờ xác nhận</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Filter size={20} className="mr-2" />
              Bộ lọc
            </button>
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

      {/* Handover Records Table */}
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
                    Mã bàn giao
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày bàn giao
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.id?.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(record.createdDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {record.orderId?.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {record.vehicleId?.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {formatDate(record.handoverDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.isAccepted)}`}>
                        {getStatusIcon(record.isAccepted)}
                        <span className="ml-1">{getStatusText(record.isAccepted)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(record.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {!record.isAccepted && (
                          <button 
                            onClick={() => handleUpdateStatus(record.id, true)}
                            className="text-green-600 hover:text-green-900"
                            title="Chấp nhận"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
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
      {!loading && filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Truck size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có bản ghi bàn giao nào</h3>
          <p className="text-gray-600">Chưa có bản ghi bàn giao nào được tạo hoặc không khớp với bộ lọc</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(currentPage - 1) * pagination.pageSize + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.pageSize, pagination.totalCount)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{pagination.totalCount}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {[...Array(pagination.totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === idx + 1
                          ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoverRecordsPage;
