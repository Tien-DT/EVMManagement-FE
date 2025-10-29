// src/features/dealer-manager/pages/DepositsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useDeposits } from '../hooks/useDeposits';
import { useNotification } from '../../../context/NotificationContext';

const DepositsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { deposits, loading, error, fetchDeposits, deleteDeposit } = useDeposits(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    fetchDeposits({ pageNumber: 1, pageSize: 50 });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa deposit này?')) {
      try {
        await deleteDeposit(id);
        showSuccess('Xóa deposit thành công');
      } catch (error) {
        showError('Không thể xóa deposit');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý', icon: Clock },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã xác nhận', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối', icon: XCircle },
    };
    const config = statusMap[status] || statusMap.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getMethodLabel = (method) => {
    const methodMap = {
      CASH: 'Tiền mặt',
      BANK_TRANSFER: 'Chuyển khoản',
      CREDIT_CARD: 'Thẻ tín dụng',
      OTHER: 'Khác',
    };
    return methodMap[method] || method;
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = 
      deposit.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.note?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || deposit.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || deposit.method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tiền cọc</h1>
          <p className="text-gray-600 mt-1">Quản lý các khoản tiền cọc của đơn hàng</p>
        </div>
        <button
          onClick={() => navigate('/dealer-manager/deposits/create')}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo deposit mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng tiền cọc</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(deposits.reduce((sum, d) => sum + (d.amount || 0), 0))}
              </p>
            </div>
            <CreditCard className="text-teal-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {deposits.filter(d => d.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã xác nhận</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {deposits.filter(d => d.status === 'CONFIRMED').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="CASH">Tiền mặt</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
            <option value="CREDIT_CARD">Thẻ tín dụng</option>
          </select>
        </div>
      </div>

      {/* Deposits List */}
      {filteredDeposits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">Chưa có deposit nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {deposit.orderId ? deposit.orderId.slice(-12) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-teal-600">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getMethodLabel(deposit.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(deposit.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 line-clamp-1">
                        {deposit.note || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/dealer-manager/deposits/${deposit.id}`)}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(deposit.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositsPage;

