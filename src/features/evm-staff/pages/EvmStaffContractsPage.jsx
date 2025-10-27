import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import useContracts from '../hooks/useContracts';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffContractsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    contracts, 
    loading, 
    error, 
    pagination,
    fetchContracts,
    deleteContract
  } = useContracts();

  // Format contract ID to readable code
  const formatContractCode = (uuid) => {
    if (!uuid) return 'N/A';
    // Extract last 8 characters and convert to uppercase
    const shortId = uuid.slice(-8).toUpperCase();
    return `CNT-${shortId}`;
  };

  // Format quotation ID to readable code
  const formatQuotationCode = (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `QUO-${shortId}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'DRAFT': 
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'PENDING_SIGNATURE': 
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'ACTIVE': 
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'CANCELED': 
        return 'bg-slate-50 text-slate-600 border border-slate-200';
      default: 
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'DRAFT': return 'Draft';
      case 'PENDING_SIGNATURE': return 'Pending Signature';
      case 'ACTIVE': return 'Active';
      case 'CANCELED': return 'Canceled';
      default: return 'Unknown';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const contractCode = contract.code || formatContractCode(contract.id);
    const quotationCode = contract.quotationCode || formatQuotationCode(contract.quotationId);
    const matchesSearch = contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.dealerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewContract = (contractId) => {
    navigate(`/evm-staff/contracts/${contractId}`);
  };

  const handleDeleteClick = (contract) => {
    setContractToDelete(contract);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteContract(contractToDelete.id);
      showSuccess('Contract deleted successfully');
      setShowDeleteModal(false);
      setContractToDelete(null);
    } catch (error) {
      console.error('Error deleting contract:', error);
      showError(error.response?.data?.message || 'Failed to delete contract');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dealer Contracts</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track dealer contracts</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/contracts/create')}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={16} />
          New Contract
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{contracts.length}</p>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-gray-900">
            {contracts.filter(c => c.status === 'PENDING_SIGNATURE').length}
          </p>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-semibold text-gray-900">
            {contracts.filter(c => c.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Canceled</p>
          <p className="text-2xl font-semibold text-gray-900">
            {contracts.filter(c => c.status === 'CANCELED').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 border border-gray-200 rounded-md">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or dealer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_SIGNATURE">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-36 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Contract Code</th>
                  <th className="w-56 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Dealer</th>
                  <th className="w-36 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Quotation</th>
                  <th className="w-40 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="w-32 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="w-36 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="w-48 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 align-middle text-center">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {contract.code || formatContractCode(contract.id)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-900 truncate w-full text-center">
                          {contract.dealerName || contract.dealer?.name || 'N/A'}
                        </span>
                        {(contract.dealerEmail || contract.dealer?.email) && (
                          <span className="text-xs text-gray-500 truncate w-full text-center">
                            {contract.dealerEmail || contract.dealer?.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <span className="text-sm font-mono text-gray-700">
                        {contract.quotationCode || formatQuotationCode(contract.quotationId)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(contract.totalValue)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex justify-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${getStatusStyle(contract.status)}`}>
                          {getStatusText(contract.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <span className="text-sm text-gray-600">
                        {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'Invalid Date'}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewContract(contract.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(contract)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
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
      {!loading && filteredContracts.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-md py-12">
          <div className="text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No contracts found</h3>
            <p className="text-xs text-gray-500">Try adjusting your search or filter</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && contractToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Contract</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete contract{' '}
              <strong className="font-mono">{contractToDelete.code || formatContractCode(contractToDelete.id)}</strong>
              {contractToDelete.dealerName && (
                <> for <strong>{contractToDelete.dealerName}</strong></>
              )}? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setContractToDelete(null);
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
                    Delete Contract
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

export default EvmStaffContractsPage;
