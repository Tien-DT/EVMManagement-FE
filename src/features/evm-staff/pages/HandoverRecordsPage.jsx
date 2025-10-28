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
      ? 'bg-green-50 text-green-700 border-green-200' 
      : 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const getStatusIcon = (isAccepted) => {
    return isAccepted ? <CheckCircle size={16} /> : <Clock size={16} />;
  };

  const getStatusText = (isAccepted) => {
    return isAccepted ? 'Accepted' : 'Pending';
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
    if (window.confirm('Are you sure you want to delete this handover record?')) {
      try {
        await deleteRecord(id);
        showSuccess('Handover record deleted successfully');
      } catch (err) {
        showError('Error occurred while deleting: ' + (err.message || 'Unknown error'));
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
      showError('Error occurred while loading page: ' + (err.message || 'Unknown error'));
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
              <h3 className="text-lg font-bold text-red-900">An Error Occurred</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Handover Record Management</h1>
          <p className="text-gray-600 mt-1">Track and manage vehicle handover process</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/handover-records/create')}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Handover
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Handovers</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
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
                placeholder="Search by ID, order, vehicle, transport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterAccepted}
            onChange={(e) => setFilterAccepted(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Handovers Table */}
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
                    Handover
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handover Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {record.id?.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-500">Order: {record.orderId?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm font-medium text-gray-900">{record.vehicleId?.substring(0, 12)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm text-gray-900">{record.transportDetailId?.substring(0, 12)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        {record.handoverDate ? new Date(record.handoverDate).toLocaleDateString('vi-VN') : 'Not Set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border-2 ${getStatusColor(record.isAccepted)}`}>
                        {getStatusIcon(record.isAccepted)}
                        <span className="ml-1.5">{getStatusText(record.isAccepted)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewRecord(record.id)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditRecord(record.id)}
                          className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(record.id)}
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
      {!loading && filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Truck size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Handover Records Found</h3>
          <p className="text-gray-600">Try changing the filter or search keywords</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{((pagination.pageNumber - 1) * pagination.pageSize) + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}
              </span>{' '}
              of <span className="font-semibold">{pagination.totalCount}</span> records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPreviousPage || loading}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md">
                {pagination.pageNumber} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoverRecordsPage;
