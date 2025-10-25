import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Car,
  Key,
  Send,
  Plus
} from 'lucide-react';
import useDealerContracts from '../hooks/useDealerContracts';

const EvmStaffContractsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { 
    contracts, 
    loading, 
    error, 
    fetchContracts 
  } = useDealerContracts();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <FileText size={16} />;
      case 'sent': return <Send size={16} />;
      case 'signed': return <CheckCircle size={16} />;
      case 'expired': return <XCircle size={16} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'draft': return 'Bản nháp';
      case 'sent': return 'Đã gửi';
      case 'signed': return 'Đã ký';
      case 'expired': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.dealerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.quotationId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateOTP = (contractId) => {
    // TODO: Implement create OTP functionality
    console.log('Create OTP for contract:', contractId);
  };

  const handleViewContract = (contractId) => {
    // TODO: Navigate to contract detail page
    console.log('View contract:', contractId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Hợp Đồng Đại Lý</h1>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi hợp đồng đại lý</p>
        </div>
        <button
          onClick={() => navigate('/evm-staff/contracts/create')}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Tạo hợp đồng
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng hợp đồng</p>
              <p className="text-2xl font-semibold text-gray-900">{contracts.length}</p>
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
                {contracts.filter(c => c.status === 'sent').length}
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
              <p className="text-sm text-gray-500 mb-1">Đã ký</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.filter(c => c.status === 'signed').length}
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
              <p className="text-sm text-gray-500 mb-1">Hết hạn</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, đại lý hoặc báo giá..."
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
            <option value="draft">Bản nháp</option>
            <option value="sent">Đã gửi</option>
            <option value="signed">Đã ký</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
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
                    Hợp đồng
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Đại lý
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Báo giá
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    OTP
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
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contract.dealerName}</div>
                          <div className="text-xs text-gray-500">{contract.dealerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{contract.quotationId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(contract.totalValue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contract.otpStatus ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Key size={12} />
                          Đã tạo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Chưa tạo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleCreateOTP(contract.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={contract.status !== 'sent' || contract.otpStatus}
                          title="Tạo OTP"
                        >
                          <Key size={18} />
                        </button>
                        <button 
                          onClick={() => handleViewContract(contract.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
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
        <div className="bg-white rounded-lg border border-gray-200 py-16">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Không có hợp đồng nào</h3>
            <p className="text-gray-500 text-sm">Chưa có hợp đồng nào được tạo</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffContractsPage;
