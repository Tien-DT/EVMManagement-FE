import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Eye,
  Trash2,
  CheckCircle,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    quotations, 
    loading, 
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
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      case 'EXPIRED': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CONVERTED_TO_ORDER': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'DRAFT': return <FileText size={16} />;
      case 'SENT': return <Send size={16} />;
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'ACCEPTED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      case 'EXPIRED': return <AlertCircle size={16} />;
      case 'CONVERTED_TO_ORDER': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'DRAFT': return 'Bản nháp';
      case 'SENT': return 'Đã gửi';
      case 'APPROVED': return 'Đã duyệt';
      case 'ACCEPTED': return 'Đã chấp nhận';
      case 'REJECTED': return 'Bị từ chối';
      case 'EXPIRED': return 'Hết hạn';
      case 'CONVERTED_TO_ORDER': return 'Đã chuyển thành đơn hàng';
      default: return 'Unknown';
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
      showSuccess('Quotation deleted successfully!');
      setShowDeleteModal(false);
      setQuotationToDelete(null);
    } catch (error) {
      showError(error.message || 'Error occurred while deleting quotation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/evm-staff/quotations/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Management</h1>
          <p className="text-gray-600 mt-1">Create and track quotations for customers</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/quotations/create')}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Quotation
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
              <p className="text-sm text-gray-600">Total Quotations</p>
              <p className="text-xl font-bold text-gray-900">{quotations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-xl font-bold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'SENT').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đã chấp nhận</p>
              <p className="text-xl font-bold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'ACCEPTED' || q.status?.toUpperCase() === 'APPROVED').length}
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
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-gray-900">
                {quotations.filter(q => q.status?.toUpperCase() === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by quotation code, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="SENT">Đã gửi</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="ACCEPTED">Đã chấp nhận</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="CONVERTED_TO_ORDER">Đã chuyển thành đơn hàng</option>
          </select>
        </div>
      </div>

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
                    Quotation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dealer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {quotation.code || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-emerald-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{quotation.customerName || 'N/A'}</div>
                          {quotation.customerEmail && <div className="text-sm text-gray-500">{quotation.customerEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quotation.dealerName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-emerald-600" />
                        <div className="text-sm font-medium text-emerald-700">
                          {quotation.total || quotation.Total || quotation.totalValue || quotation.totalAmount 
                            ? formatCurrency(quotation.total || quotation.Total || quotation.totalValue || quotation.totalAmount) 
                            : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getStatusColor(quotation.status)}`}>
                        {getStatusIcon(quotation.status)}
                        <span className="ml-1.5">{getStatusText(quotation.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        {quotation.createdDate ? new Date(quotation.createdDate).toLocaleDateString('vi-VN') : 
                         quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(quotation.id)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(quotation)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete"
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
      {!loading && filteredQuotations.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Found</h3>
          <p className="text-gray-600">Try changing the filter or search keywords</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quotationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Quotation</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete quotation{' '}
              <strong className="font-mono">{quotationToDelete.code || quotationToDelete.id}</strong>
              {quotationToDelete.customerName && (
                <> for customer <strong>{quotationToDelete.customerName}</strong></>
              )}? 
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setQuotationToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Quotation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffQuotationsPage;
