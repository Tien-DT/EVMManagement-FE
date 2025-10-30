import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  MapPin, 
  Building, 
  Edit, 
  Trash2,
  Eye,
  Car
} from 'lucide-react';
import CreateWarehouseModal from '../components/CreateWarehouseModal';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import AddEvmVehicleToWarehouseForm from '../../evm-staff/components/AddEvmVehicleToWarehouseForm';
import { Modal, Tooltip } from 'antd';

const AdminWarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.warehouses.getAll);
      const data = response.data?.items || response.data || [];
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = () => {
    setSelectedWarehouse(null);
    setShowCreateModal(true);
  };

  const handleEditWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowCreateModal(true);
  };

  const handleDeleteWarehouse = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kho này?')) return;

    try {
      await axiosInstance.delete(endpoints.warehouses.delete(id));
      alert('Xóa kho thành công!');
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Lỗi khi xóa kho: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setSelectedWarehouse(null);
  };

  const handleModalSuccess = () => {
    fetchWarehouses();
    handleModalClose();
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const evmWarehouses = filteredWarehouses.filter(w => w.type === 'EVM');
  const dealerWarehouses = filteredWarehouses.filter(w => w.type === 'DEALER');

  const getTypeColor = (type) => {
    return type === 'EVM' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getTypeText = (type) => {
    return type === 'EVM' ? 'EVM' : 'Dealer';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả các kho hàng trong hệ thống</p>
        </div>
        <button
          onClick={handleCreateWarehouse}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Tạo kho mới</span>
        </button>
        {/* ĐÃ XÓA nút Thêm xe vào kho EVM lớn ở đây */}
      </div>
      {/* Modal Add Evm Vehicle cho từng kho */}
      <Modal
        title="Thêm xe vào kho EVM"
        open={showAddVehicleModal}
        onCancel={() => setShowAddVehicleModal(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <AddEvmVehicleToWarehouseForm warehouseId={selectedWarehouseId} />
      </Modal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng số kho</p>
              <p className="text-xl font-bold text-gray-900">{warehouses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Kho EVM</p>
              <p className="text-xl font-bold text-gray-900">{evmWarehouses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Kho Dealer</p>
              <p className="text-xl font-bold text-gray-900">{dealerWarehouses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm kho theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Không tìm thấy kho nào</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sức chứa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={20} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {warehouse.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">
                          {warehouse.address}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {warehouse.capacity} xe
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(warehouse.type)}`}>
                        {getTypeText(warehouse.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditWarehouse(warehouse)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        {/* Nút Add Vehicle cho kho EVM */}
                        {warehouse.type === 'EVM' && (
                          <Tooltip title="Thêm xe vào kho này">
                            <button
                              onClick={() => {
                                setSelectedWarehouseId(warehouse.id);
                                setShowAddVehicleModal(true);
                              }}
                              style={{ color: '#059669' }}
                              title="Thêm xe vào kho này"
                            >
                              <Car size={19} style={{ marginRight: 3, verticalAlign: 'middle' }} />+
                            </button>
                          </Tooltip>
                        )}
                        <button
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                          className="text-red-600 hover:text-red-900"
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
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateWarehouseModal
          visible={showCreateModal}
          warehouse={selectedWarehouse}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminWarehousesPage;
