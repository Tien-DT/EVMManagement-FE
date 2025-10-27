import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
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
  Send,
  TrendingUp,
  Package
} from 'lucide-react';
import useQuotations from '../hooks/useQuotations';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffQuotationsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SENT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      case 'EXPIRED': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'DRAFT': return <FileText size={16} />;
      case 'SENT': return <Send size={16} />;
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

  const handleDeleteClick = (quotation) => {
    setQuotationToDelete(quotation);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quotationToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteQuotation(quotationToDelete.id);
      showSuccess('Xóa báo giá thành công!');
      setShowDeleteModal(false);
      setQuotationToDelete(null);
    } catch (error) {
      showError(error.message || 'Có lỗi xảy ra khi xóa báo giá');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/evm-staff/quotations/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center animate-slideIn">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Quản Lý Báo Giá
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Tạo và theo dõi báo giá cho khách hàng</p>
          </div>
          <button
            onClick={() => navigate('/evm-staff/quotations/create')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={20} />
            Tạo báo giá mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-scaleIn">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng báo giá</p>
                <p className="text-3xl font-bold text-gray-900">{quotations.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={14} className="text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Hoạt động</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText size={28} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Đã gửi</p>
                <p className="text-3xl font-bold text-blue-600">
                  {quotations.filter(q => q.status?.toUpperCase() === 'SENT').length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-xs text-blue-500 font-medium">Chờ phản hồi</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Send size={28} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Đã duyệt</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {quotations.filter(q => q.status?.toUpperCase() === 'APPROVED').length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">Thành công</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle size={28} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bị từ chối</p>
                <p className="text-3xl font-bold text-red-600">
                  {quotations.filter(q => q.status?.toUpperCase() === 'REJECTED').length}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <XCircle size={14} className="text-red-500" />
                  <span className="text-xs text-red-500 font-medium">Cần xem lại</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <XCircle size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-slideIn">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã báo giá, khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
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
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-red-600" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden animate-slideIn">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="w-48 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Mã báo giá
                    </th>
                    <th className="w-56 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="w-44 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Đại lý
                    </th>
                    <th className="w-40 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tổng
                    </th>
                    <th className="w-36 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="w-32 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="w-40 px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredQuotations.map((quotation, index) => (
                    <tr 
                      key={quotation.id} 
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 truncate">{quotation.code || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-purple-600" />
                          </div>
                          <div className="text-center min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">{quotation.customerName || 'N/A'}</div>
                            {quotation.customerEmail && <div className="text-xs text-gray-500 truncate">{quotation.customerEmail}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <span className="text-sm font-medium text-gray-700 truncate block">{quotation.dealerName || '-'}</span>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <DollarSign size={15} className="text-emerald-600 flex-shrink-0" />
                          <span className="text-sm font-bold text-emerald-600 truncate">
                            {quotation.total || quotation.Total || quotation.totalValue || quotation.totalAmount 
                              ? formatCurrency(quotation.total || quotation.Total || quotation.totalValue || quotation.totalAmount) 
                              : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 whitespace-nowrap ${getStatusColor(quotation.status)}`}>
                            {getStatusIcon(quotation.status)}
                            {getStatusText(quotation.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-600">
                            {quotation.createdDate ? new Date(quotation.createdDate).toLocaleDateString('vi-VN') : 
                             quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('vi-VN') : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleViewDetail(quotation.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                            Xem
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(quotation)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                            Xóa
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
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-20 animate-fadeIn">
            <div className="text-center">
              <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl mb-6 shadow-lg">
                <FileText size={48} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Không có báo giá nào</h3>
              <p className="text-gray-500 mb-6">Chưa có báo giá nào được tạo. Hãy tạo báo giá đầu tiên!</p>
              <button
                onClick={() => navigate('/evm-staff/quotations/create')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
              >
                <Plus size={20} />
                Tạo báo giá mới
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && quotationToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Xóa Báo Giá</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Bạn có chắc chắn muốn xóa báo giá{' '}
                <strong className="font-bold text-gray-900">{quotationToDelete.code || quotationToDelete.id}</strong>
                {quotationToDelete.customerName && (
                  <> cho khách hàng <strong className="font-bold text-gray-900">{quotationToDelete.customerName}</strong></>
                )}? 
                <br /><span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setQuotationToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-sm text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-sm text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg transition-all"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Xóa Báo Giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvmStaffQuotationsPage;
