import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search } from 'lucide-react';
import dealerContractService from '../../../evm-staff/services/dealerContractService';

const DealerContractsListPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await dealerContractService.getAllContracts();
      const contractsData = response.data || response;
      setContracts(contractsData.items || []);
    } catch (error) {
      console.error('Error fetching dealer contracts:', error);
      alert('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => 
    contract.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hợp đồng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <div className="text-xs text-gray-500">{contract.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('vi-VN') : 'Chưa ký'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

