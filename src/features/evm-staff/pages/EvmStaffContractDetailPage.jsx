import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar,
  User,
  Building,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileSignature
} from 'lucide-react';
import useContracts from '../hooks/useContracts';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffContractDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getContractById, deleteContract, updateContractStatus, loading } = useContracts(false);
  
  const [contract, setContract] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      const response = await getContractById(id);
      const contractData = response.data || response;
      setContract(contractData);
    } catch (error) {
      console.error('Error fetching contract details:', error);
      showError('Failed to load contract details');
    }
  };

  // Format contract ID to readable code
  const formatContractCode = (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `CNT-${shortId}`;
  };

  // Format quotation ID to readable code
  const formatQuotationCode = (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `QUO-${shortId}`;
  };

  // Format order ID to readable code
  const formatOrderCode = (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `ORD-${shortId}`;
  };

  // Format customer ID to readable code
  const formatCustomerCode = (uuid) => {
    if (!uuid) return 'N/A';
    const shortId = uuid.slice(-8).toUpperCase();
    return `CUS-${shortId}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'DRAFT':
        return <FileText size={20} className="text-gray-600" />;
      case 'PENDING_SIGNATURE':
        return <Clock size={20} className="text-amber-600" />;
      case 'ACTIVE':
        return <CheckCircle size={20} className="text-emerald-600" />;
      case 'CANCELED':
        return <XCircle size={20} className="text-slate-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContract(id);
      showSuccess('Contract deleted successfully');
      navigate('/evm-staff/contracts');
    } catch (error) {
      console.error('Error deleting contract:', error);
      showError(error.response?.data?.message || 'Failed to delete contract');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    
    try {
      await updateContractStatus(id, selectedStatus);
      showSuccess('Contract status updated successfully');
      setShowStatusModal(false);
      await fetchContractDetails();
    } catch (error) {
      console.error('Error updating contract status:', error);
      showError(error.response?.data?.message || 'Failed to update contract status');
    }
  };

  if (loading || !contract) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/evm-staff/contracts')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Contract {contract.code || formatContractCode(contract.id)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">View and manage contract details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStatus(contract.status);
              setShowStatusModal(true);
            }}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <FileSignature size={16} />
            Update Status
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        {getStatusIcon(contract.status)}
        <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded ${getStatusStyle(contract.status)}`}>
          {getStatusText(contract.status)}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Contract Details */}
        <div className="col-span-2 space-y-6">
          {/* Contract Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Contract Code</label>
                  <p className="text-sm font-mono font-medium text-gray-900 mt-1">
                    {contract.code || formatContractCode(contract.id)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <p className="text-sm text-gray-900 mt-1">{getStatusText(contract.status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Quotation Code</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {contract.quotationCode || formatQuotationCode(contract.quotationId)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Order Code</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {contract.orderCode || formatOrderCode(contract.orderId)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Customer Code</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {contract.customerCode || formatCustomerCode(contract.customerId)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Created By</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {contract.createdByUserName || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Contract Link</label>
                {contract.contractLink ? (
                  <a 
                    href={contract.contractLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline mt-1 block"
                  >
                    View Contract Document
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">No document attached</p>
                )}
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
            <div className="prose prose-sm max-w-none">
              {contract.terms ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
              ) : (
                <p className="text-sm text-gray-500">No terms specified</p>
              )}
            </div>
          </div>

          {/* Dealer Information */}
          {contract.dealerName && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dealer Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{contract.dealerName}</span>
                </div>
                {contract.dealerEmail && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{contract.dealerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Financial Summary */}
          {contract.totalValue && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-emerald-700" />
                <h3 className="text-sm font-medium text-emerald-900">Total Value</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {formatCurrency(contract.totalValue)}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">Created</span>
                </div>
                <p className="text-sm text-gray-900 ml-5">{formatDate(contract.createdAt)}</p>
              </div>

              {contract.signedAt && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <FileSignature size={14} />
                    <span className="text-xs font-medium">Signed</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">{formatDate(contract.signedAt)}</p>
                </div>
              )}

              {contract.updatedAt && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">{formatDate(contract.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contract ID */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xs font-medium text-gray-600 mb-2">Contract UUID</h3>
            <p className="text-xs font-mono text-gray-500 break-all">{contract.id}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Contract</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete contract <strong className="font-mono">{contract.code || formatContractCode(contract.id)}</strong>? 
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileSignature size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Update Contract Status</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING_SIGNATURE">Pending Signature</option>
                <option value="ACTIVE">Active</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={loading || selectedStatus === contract.status}
                className="px-4 py-2 text-sm text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffContractDetailPage;

