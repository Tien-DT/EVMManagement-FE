// src/features/evm-staff/pages/HandoverRecordsPage.jsx
import React, { useState, useMemo } from 'react';
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
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import useHandoverRecords from '../hooks/useHandoverRecords';
import { useNotification } from '../../../context/NotificationContext';

const HandoverRecordsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccepted, setFilterAccepted] = useState('all'); // all, accepted, pending
  
  const { 
    records, 
    loading, 
    error, 
    pagination,
    fetchRecords,
    deleteRecord
  } = useHandoverRecords();

  const getStatusColor = (isAccepted) => {
    return isAccepted 
      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
      : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200';
  };

  const getStatusIcon = (isAccepted) => {
    return isAccepted ? <CheckCircle size={16} /> : <Clock size={16} />;
  };

  const getStatusText = (isAccepted) => {
    return isAccepted ? 'Đã chấp nhận' : 'Chờ xác nhận';
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    return records.filter(record => {
      // Search filter
      const matchesSearch = !searchTerm || 
        record.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.transportDetailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filterAccepted === 'all' ||
        (filterAccepted === 'accepted' && record.isAccepted) ||
        (filterAccepted === 'pending' && !record.isAccepted);

      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, filterAccepted]);

  const handleViewRecord = (id) => {
    navigate(`/evm-staff/handover-records/${id}`);
  };

  const handleEditRecord = (id) => {
    navigate(`/evm-staff/handover-records/${id}/edit`);
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi bàn giao này?')) {
      try {
        await deleteRecord(id);
        showSuccess('Xóa bản ghi bàn giao thành công');
      } catch (err) {
        showError('Có lỗi xảy ra khi xóa: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handlePageChange = async (newPage) => {
    try {
      await fetchRecords({
        pageNumber: newPage,
        pageSize: pagination.pageSize
      });
    } catch (err) {
      showError('Có lỗi xảy ra khi tải trang: ' + (err.message || 'Unknown error'));
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = records.length;
    const accepted = records.filter(r => r.isAccepted).length;
    const pending = records.filter(r => !r.isAccepted).length;
    
    return { total, accepted, pending };
  }, [records]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-center gap-4">
            <AlertCircle size={48} className="text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Có lỗi xảy ra</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-slideIn">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200">
                <Truck className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Quản lý Bàn Giao Xe
                </h1>
                <p className="text-gray-600 mt-1">Theo dõi và quản lý quá trình bàn giao xe cho khách hàng</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/evm-staff/handover-records/create')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo Bàn Giao Mới
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Tổng số</p>
                  <p className="text-4xl font-bold text-blue-900 mt-2">{stats.total}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-scaleIn" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Đã Chấp Nhận</p>
                  <p className="text-4xl font-bold text-green-900 mt-2">{stats.accepted}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-scaleIn" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Chờ Xác Nhận</p>
                  <p className="text-4xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 animate-slideIn">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, đơn hàng, xe, vận chuyển..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterAccepted}
                onChange={(e) => setFilterAccepted(e.target.value)}
                className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="accepted">Đã chấp nhận</option>
                <option value="pending">Chờ xác nhận</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-slideIn">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={48} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không có dữ liệu</h3>
              <p className="text-gray-600 mb-6">Chưa có bản ghi bàn giao nào được tạo</p>
              <button
                onClick={() => navigate('/evm-staff/handover-records/create')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Tạo Bàn Giao Đầu Tiên
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">ID / Đơn Hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Xe</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Vận Chuyển</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Ngày Bàn Giao</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Trạng Thái</th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 cursor-pointer animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-md">
                              {record.id?.substring(0, 2).toUpperCase() || 'HR'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{record.id?.substring(0, 12)}...</div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Package size={12} className="mr-1" />
                                {record.orderId?.substring(0, 12)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                              <Car size={18} className="text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">{record.vehicleId?.substring(0, 12)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="bg-purple-50 px-3 py-2 rounded-lg inline-block">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <Truck size={14} className="mr-2 text-purple-600" />
                              {record.transportDetailId?.substring(0, 12)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {record.handoverDate ? new Date(record.handoverDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(record.isAccepted)}`}>
                            {getStatusIcon(record.isAccepted)}
                            <span className="ml-1.5">{getStatusText(record.isAccepted)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewRecord(record.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditRecord(record.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Chỉnh sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị <span className="font-semibold">{((pagination.pageNumber - 1) * pagination.pageSize) + 1}</span> đến{' '}
                      <span className="font-semibold">
                        {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}
                      </span>{' '}
                      trong tổng số <span className="font-semibold">{pagination.totalCount}</span> bản ghi
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.pageNumber - 1)}
                        disabled={!pagination.hasPreviousPage || loading}
                        className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-emerald-50 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        <ChevronLeft size={18} />
                        Trước
                      </button>
                      <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg">
                        {pagination.pageNumber} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.pageNumber + 1)}
                        disabled={!pagination.hasNextPage || loading}
                        className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-emerald-50 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        Sau
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandoverRecordsPage;
