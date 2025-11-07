import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Filter, X } from 'lucide-react';
import dealerContractService from '../../../evm-staff/services/dealerContractService';
import dealerService from '../../../dealer/services/dealerService';

const DealerContractsListPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [dealerMap, setDealerMap] = useState({});
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dealerId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  // Fetch dealers separately for filter dropdown
  useEffect(() => {
    const fetchDealersForFilter = async () => {
      try {
        const response = await dealerService.list({ pageNumber: 1, pageSize: 100 });
        console.log('📋 Dealers API response:', response);
        
        let dealersData = [];
        
        // Handle different response structures
        if (response?.data?.items) {
          dealersData = response.data.items;
        } else if (response?.data && Array.isArray(response.data)) {
          dealersData = response.data;
        } else if (response?.items) {
          dealersData = response.items;
        } else if (Array.isArray(response)) {
          dealersData = response;
        } else if (response?.data?.data?.items) {
          dealersData = response.data.data.items;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          dealersData = response.data.data;
        }
        
        console.log('✅ Dealers loaded for filter:', dealersData.length);
        if (dealersData.length > 0) {
          console.log('📝 First dealer sample:', dealersData[0]);
        }
        setDealers(dealersData);
      } catch (error) {
        console.error('❌ Error fetching dealers list:', error);
        console.error('❌ Error response:', error.response?.data);
        // Don't show alert, just log error
      }
    };

    fetchDealersForFilter();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await dealerContractService.getAllContracts();
      const contractsData = response.data || response;
      const contractsList = contractsData.items || [];
      
      // Sort by created date (newest first)
      const sortedContracts = [...contractsList].sort((a, b) => {
        const dateA = a.createdAt || a.createdDate || a.created_date || a.created_at;
        const dateB = b.createdAt || b.createdDate || b.created_date || b.created_at;
        
        const timeA = dateA ? new Date(dateA).getTime() : 0;
        const timeB = dateB ? new Date(dateB).getTime() : 0;
        
        return timeB - timeA; // Sort descending (newest first)
      });
      
      setContracts(sortedContracts);
      
      // Log contract data to see available date fields
      if (contractsList.length > 0) {
        console.log('📅 Sample contract data:', contractsList[0]);
        console.log('📅 Date fields available:', {
          createdAt: contractsList[0].createdAt,
          createdDate: contractsList[0].createdDate,
          created_date: contractsList[0].created_date,
          created_at: contractsList[0].created_at,
          signedAt: contractsList[0].signedAt,
          signedDate: contractsList[0].signedDate,
          signed_date: contractsList[0].signed_date,
          signed_at: contractsList[0].signed_at
        });
      }
      
      // Fetch dealer info for each unique dealerId
      const uniqueDealerIds = [...new Set(contractsList.map(c => c.dealerId).filter(Boolean))];
      const dealerInfoMap = {};
      
      for (const dealerId of uniqueDealerIds) {
        try {
          const dealerResponse = await dealerService.getById(dealerId);
          const dealerData = dealerResponse.data || dealerResponse;
          dealerInfoMap[dealerId] = dealerData;
        } catch (error) {
          console.error(`Error fetching dealer ${dealerId}:`, error);
        }
      }
      
      setDealerMap(dealerInfoMap);
      console.log('✅ Dealer info loaded:', dealerInfoMap);
    } catch (error) {
      console.error('Error fetching dealer contracts:', error);
      alert('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    // Search filter
    const matchesSearch = !searchTerm || 
      contract.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = !filters.status || contract.status === filters.status;
    
    // Dealer filter
    const matchesDealer = !filters.dealerId || contract.dealerId === filters.dealerId;
    
    // Date range filter
    let matchesDate = true;
    if (filters.dateFrom || filters.dateTo) {
      const contractDate = contract.createdAt || contract.createdDate || contract.created_date || contract.created_at;
      if (contractDate) {
        const contractDateObj = new Date(contractDate);
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (contractDateObj < fromDate) matchesDate = false;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (contractDateObj > toDate) matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDealer && matchesDate;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dealerId: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filters.status || filters.dealerId || filters.dateFrom || filters.dateTo;

  const getStatusColor = (status) => {
    switch(status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING_SIGNATURE': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'DRAFT': return 'Bản nháp';
      case 'PENDING_SIGNATURE': return 'Chờ ký';
      case 'ACTIVE': return 'Đang hoạt động';
      case 'CANCELED': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hợp đồng Dealer</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý hợp đồng giữa EVM và Dealer</p>
        </div>
        <button
          onClick={() => navigate('/admin/dealer-contracts/create')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo hợp đồng mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Bộ lọc
            {hasActiveFilters && (
              <span className="bg-white text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                {[filters.status, filters.dealerId, filters.dateFrom, filters.dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="">Tất cả</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PENDING_SIGNATURE">Chờ ký</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="CANCELED">Đã hủy</option>
                </select>
              </div>

              {/* Dealer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đại lý
                </label>
                <select
                  value={filters.dealerId}
                  onChange={(e) => handleFilterChange('dealerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="">Tất cả</option>
                  {dealers.length === 0 ? (
                    <option value="" disabled>Đang tải đại lý...</option>
                  ) : (
                    dealers.map((dealer) => {
                      // Try multiple possible field names for dealer name
                      const dealerName = dealer.name || 
                                       dealer.dealerName || 
                                       dealer.dealer?.name ||
                                       dealer.dealer?.dealerName ||
                                       dealerMap[dealer.id]?.name ||
                                       dealerMap[dealer.id]?.dealerName ||
                                       `Đại lý ${dealer.id?.slice(-6) || dealer.id || ''}`;
                      
                      return (
                        <option key={dealer.id} value={dealer.id}>
                          {dealerName}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
                >
                  <X size={16} />
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã hợp đồng
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày ký
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>Chưa có hợp đồng nào</p>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dealerMap[contract.dealerId]?.dealerName || dealerMap[contract.dealerId]?.name || 'Dealer'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {contract.createdAt || contract.createdDate || contract.created_date 
                        ? new Date(contract.createdAt || contract.createdDate || contract.created_date).toLocaleDateString('vi-VN') 
                        : contract.created_at 
                        ? new Date(contract.created_at).toLocaleDateString('vi-VN') 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {contract.signedAt || contract.signedDate || contract.signed_date 
                        ? new Date(contract.signedAt || contract.signedDate || contract.signed_date).toLocaleDateString('vi-VN') 
                        : contract.signed_at 
                        ? new Date(contract.signed_at).toLocaleDateString('vi-VN') 
                        : 'Chưa ký'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        onClick={() => navigate(`/admin/dealer-contracts/${contract.id}`)}
                        className="text-gray-900 hover:text-gray-700"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Tổng số</p>
          <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Bản nháp</p>
          <p className="text-2xl font-bold text-gray-900">
            {contracts.filter(c => c.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Chờ ký</p>
          <p className="text-2xl font-bold text-yellow-600">
            {contracts.filter(c => c.status === 'PENDING_SIGNATURE').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {contracts.filter(c => c.status === 'ACTIVE').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealerContractsListPage;

