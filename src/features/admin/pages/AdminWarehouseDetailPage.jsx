import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Building, 
  ArrowLeft,
  Edit,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Table, Tag, Image, Card, Statistic, Button, Modal } from 'antd';
import { useWarehouse } from '../hooks/useWarehouses';
import AddEvmVehicleToWarehouseForm from '../../evm-staff/components/AddEvmVehicleToWarehouseForm';

const AdminWarehouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  
  const {
    warehouse,
    isLoading,
    error,
    refreshWarehouse,
  } = useWarehouse(id);

  useEffect(() => {
    if (warehouse) {
      const vehiclesData = warehouse.vehicles || [];
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    }
  }, [warehouse]);

  const getTypeColor = (type) => {
    return type === 'EVM' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getTypeText = (type) => {
    return type === 'EVM' ? 'EVM' : 'Dealer';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return 'green';
      case 'SOLD':
        return 'red';
      case 'RESERVED':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return 'Có sẵn';
      case 'SOLD':
        return 'Đã bán';
      case 'RESERVED':
        return 'Đã đặt';
      default:
        return status;
    }
  };

  const vehicleColumns = [
    {
      title: 'VIN',
      dataIndex: 'vin',
      key: 'vin',
      render: (vin) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{vin || 'N/A'}</span>
      ),
    },
    {
      title: 'Màu xe',
      key: 'color',
      render: (_, record) => record.variant?.color || record.vehicleVariant?.color || 'N/A',
    },
    {
      title: 'Model',
      key: 'model',
      render: (_, record) => 
        record.variant?.vehicleModel?.name || 
        record.vehicleVariant?.vehicleModel?.name || 
        record.vehicleModel?.name || 
        'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Mục đích',
      dataIndex: 'purpose',
      key: 'purpose',
      render: (purpose) => {
        const purposeMap = {
          'FOR_SALE': 'Để bán',
          'FOR_TEST_DRIVE': 'Cho lái thử',
          'FOR_RENT': 'Cho thuê',
        };
        return purposeMap[purpose] || purpose;
      },
    },
    {
      title: 'Ảnh',
      key: 'image',
      render: (_, record) => (
        record.imageUrl ? (
          <Image
            src={record.imageUrl}
            alt="Vehicle"
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
          />
        ) : (
          <span style={{ color: '#999' }}>Không có ảnh</span>
        )
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error || 'Không tìm thấy kho'}</p>
          <Button
            type="primary"
            onClick={() => navigate('/admin/warehouses')}
          >
            Quay lại danh sách kho
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/warehouses')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
            <p className="text-gray-600 mt-1">Chi tiết kho hàng</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<Edit size={16} />}
            onClick={() => navigate(`/admin/warehouses/${id}/edit`)}
            type="default"
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <Statistic
            title="Sức chứa"
            value={warehouse.capacity || 0}
            suffix="xe"
            valueStyle={{ color: '#1890ff', fontSize: '24px' }}
          />
        </Card>
        <Card className="shadow-md">
          <Statistic
            title="Số xe hiện có"
            value={vehicles.length}
            suffix="xe"
            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
          />
        </Card>
        <Card className="shadow-md">
          <Statistic
            title="Xe có sẵn"
            value={vehicles.filter(v => v.status === 'IN_STOCK').length}
            suffix="xe"
            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
          />
        </Card>
        <Card className="shadow-md">
          <Statistic
            title="Tỷ lệ sử dụng"
            value={warehouse.capacity ? Math.round((vehicles.length / warehouse.capacity) * 100) : 0}
            suffix="%"
            valueStyle={{ color: '#faad14', fontSize: '24px' }}
          />
        </Card>
      </div>

      {/* Warehouse Info */}
      <Card title="Thông tin kho hàng" className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tên kho</p>
              <p className="text-base font-semibold text-gray-900">{warehouse.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
              <p className="text-base font-semibold text-gray-900">{warehouse.address || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Loại kho</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(warehouse.type)}`}>
                {getTypeText(warehouse.type)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicles Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Danh sách xe trong kho ({vehicles.length})</span>
            {warehouse.type === 'EVM' && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 border-none"
              >
                Thêm xe vào kho
              </Button>
            )}
          </div>
        }
        className="shadow-md"
      >
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Chưa có xe nào trong kho này</p>
            {warehouse.type === 'EVM' && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 border-none"
              >
                Thêm xe vào kho
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={vehicleColumns}
            dataSource={vehicles.map(v => ({ ...v, key: v.id || v.vin }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} xe`,
            }}
            loading={isLoading}
          />
        )}
      </Card>

      {/* Modal Add Evm Vehicle */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
            Thêm xe vào kho EVM
          </div>
        }
        open={showAddVehicleModal}
        onCancel={() => {
          setShowAddVehicleModal(false);
        }}
        footer={null}
        width={1000}
        destroyOnClose
        style={{ top: 20 }}
        bodyStyle={{ 
          padding: '24px',
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto'
        }}
      >
        <AddEvmVehicleToWarehouseForm 
          warehouseId={id}
          onSuccess={() => {
            setShowAddVehicleModal(false);
            refreshWarehouse();
          }}
        />
      </Modal>
    </div>
  );
};

export default AdminWarehouseDetailPage;

