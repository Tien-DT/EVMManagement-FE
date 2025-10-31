import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Building, 
  ArrowLeft,
  Edit,
  Plus
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { Table, Tag, Image, Card, Row, Col, Statistic, Space, Button, message } from 'antd';

const AdminWarehouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWarehouseDetail();
  }, [id]);

  const fetchWarehouseDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(endpoints.warehouses.getById(id));
      const warehouseData = response.data || response;
      
      setWarehouse(warehouseData);
      
      // Lấy danh sách xe trong kho
      const vehiclesData = warehouseData.vehicles || [];
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      console.error('Error fetching warehouse detail:', err);
      setError(err?.message || 'Không thể tải thông tin kho');
      message.error('Không thể tải thông tin kho: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy kho'}</p>
          <Link to="/admin/warehouses" className="text-blue-600 hover:underline">
            Quay lại danh sách kho
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/warehouses"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
            <p className="text-gray-600 mt-1">Chi tiết kho hàng</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/warehouses/${id}/edit`}>
            <Button icon={<Edit size={16} />} type="default">
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sức chứa"
              value={warehouse.capacity || 0}
              suffix="xe"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số xe hiện có"
              value={vehicles.length}
              suffix="xe"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Xe có sẵn"
              value={vehicles.filter(v => v.status === 'IN_STOCK').length}
              suffix="xe"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ sử dụng"
              value={warehouse.capacity ? Math.round((vehicles.length / warehouse.capacity) * 100) : 0}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Warehouse Info */}
      <Card title="Thông tin kho hàng">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="flex items-start gap-3 mb-4">
              <Building size={20} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Tên kho</p>
                <p className="text-base font-medium">{warehouse.name}</p>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex items-start gap-3 mb-4">
              <MapPin size={20} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="text-base font-medium">{warehouse.address || 'N/A'}</p>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex items-start gap-3 mb-4">
              <Package size={20} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Loại kho</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(warehouse.type)}`}>
                  {getTypeText(warehouse.type)}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Vehicles Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>Danh sách xe trong kho ({vehicles.length})</span>
            {warehouse.type === 'EVM' && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  // Có thể mở modal thêm xe hoặc navigate
                  window.location.hash = `#add-vehicle-${id}`;
                }}
              >
                Thêm xe vào kho
              </Button>
            )}
          </div>
        }
      >
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Chưa có xe nào trong kho này</p>
            {warehouse.type === 'EVM' && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                className="mt-4"
                onClick={() => {
                  window.location.hash = `#add-vehicle-${id}`;
                }}
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
            loading={loading}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminWarehouseDetailPage;

