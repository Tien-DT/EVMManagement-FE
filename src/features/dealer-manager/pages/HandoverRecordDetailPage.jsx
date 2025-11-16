import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Spin, 
  Tag, 
  Space, 
  Breadcrumb,
  Alert,
  Divider
} from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CalendarOutlined,
  TruckOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useNotification } from '../../../context/NotificationContext';

const HandoverRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [order, setOrder] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [transport, setTransport] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchRecordDetail();
  }, [id]);

  const fetchRecordDetail = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.handoverRecords.getById(id));
      const recordData = response.data;
      setRecord(recordData);

      // Order, vehicle, and transport data might be nested in the response
      if (recordData.order) {
        setOrder(recordData.order);
      }

      if (recordData.vehicle) {
        setVehicle(recordData.vehicle);
      }

      if (recordData.transport) {
        setTransport(recordData.transport);
      }

      // If not nested, fetch separately
      if (!recordData.order && recordData.orderId) {
        try {
          const orderResponse = await axiosInstance.get(endpoints.orders.getById(recordData.orderId));
          setOrder(orderResponse.data);
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      }

      if (!recordData.vehicle && recordData.vehicleId) {
        try {
          const vehicleResponse = await axiosInstance.get(endpoints.vehicles.getById(recordData.vehicleId));
          setVehicle(vehicleResponse.data);
        } catch (err) {
          console.error('Error fetching vehicle:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching handover record:', error);
      showError('Không thể tải thông tin bàn giao xe');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConfirmHandover = async () => {
    if (!transport || !transport.id) {
      showError('Không tìm thấy thông tin vận chuyển');
      return;
    }

    const confirmed = window.confirm(
      'Xác nhận bàn giao xe?\n\n' +
      'Hành động này sẽ xác nhận rằng bạn đã nhận được xe từ nhà vận chuyển.'
    );

    if (!confirmed) return;

    setConfirming(true);
    try {
      await axiosInstance.put(endpoints.transports.confirmHandover(transport.id));
      showSuccess('Xác nhận bàn giao thành công!');
      // Reload data
      await fetchRecordDetail();
    } catch (error) {
      console.error('Error confirming handover:', error);
      showError(error.response?.data?.message || 'Không thể xác nhận bàn giao');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6">
        <Alert
          message="Không tìm thấy bàn giao xe"
          description="Bàn giao xe không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={() => navigate('/dealer-manager/handover-records')} style={{ cursor: 'pointer' }}>
          <FileTextOutlined />
          <span style={{ marginLeft: 8 }}>Bàn giao xe</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết bàn giao</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <div style={{ marginBottom: 24 }}>
          <Space style={{ marginBottom: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dealer-manager/handover-records')}
            >
              Quay lại
            </Button>
            {/* Show confirm button only if not yet accepted and transport exists */}
            {record.isAccepted === false && transport && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmHandover}
                loading={confirming}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Xác nhận bàn giao
              </Button>
            )}
          </Space>
          <h2 style={{ margin: '16px 0 0 0', fontSize: 24, fontWeight: 600 }}>
            Chi tiết bàn giao xe #{record.id}
          </h2>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 24 }}>
          {record.isAccepted === true ? (
            <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 16, padding: '8px 16px' }}>
              Đã xác nhận
            </Tag>
          ) : record.isAccepted === false ? (
            <Tag icon={<ClockCircleOutlined />} color="warning" style={{ fontSize: 16, padding: '8px 16px' }}>
              Chưa xác nhận
            </Tag>
          ) : (
            <Tag color="default" style={{ fontSize: 16, padding: '8px 16px' }}>
              Chưa rõ
            </Tag>
          )}
        </div>

        {/* Handover Information */}
        <Divider orientation="left">Thông tin bàn giao</Divider>
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
          <Descriptions.Item label="ID bàn giao">
            <span className="font-mono text-gray-600">{record.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> Ngày bàn giao</>}>
            {formatDate(record.handoverDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {record.notes || '-'}
          </Descriptions.Item>
        </Descriptions>

        {/* Order Information */}
        {order && (
          <>
            <Divider orientation="left">Thông tin đơn hàng</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Mã đơn hàng">
                <span className="font-mono text-blue-600">{order.code || `#${order.id}`}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Loại đơn hàng">
                <Tag color={order.orderType === 'B2B' ? 'purple' : 'green'}>
                  {order.orderType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="blue">{order.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(order.createdDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền cuối">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalAmount || 0)}
              </Descriptions.Item>
              {order.discountAmount > 0 && (
                <Descriptions.Item label="Giảm giá" span={2}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountAmount)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Vehicle Information */}
        {vehicle && (
          <>
            <Divider orientation="left">Thông tin xe</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label={<><CarOutlined /> VIN</>}>
                <span className="font-mono font-bold text-lg">{vehicle.vin || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={vehicle.status === 'SOLD' ? 'green' : 'blue'}>{vehicle.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mục đích">
                <Tag color="orange">{vehicle.purpose || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(vehicle.createdDate)}
              </Descriptions.Item>
              {vehicle.imageUrl && (
                <Descriptions.Item label="Hình ảnh" span={2}>
                  <img 
                    src={vehicle.imageUrl} 
                    alt="Vehicle" 
                    style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Transport Information */}
        {transport && (
          <>
            <Divider orientation="left">Thông tin vận chuyển</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label={<><TruckOutlined /> Nhà vận chuyển</>}>
                {transport.providerName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={transport.status === 'DELIVERED' ? 'green' : 'blue'}>
                  {transport.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm lấy hàng">
                {transport.pickupLocation || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm giao hàng">
                {transport.dropoffLocation || transport.dealerAddress || '-'}
              </Descriptions.Item>
              {transport.scheduledPickupAt && (
                <Descriptions.Item label="Thời gian lấy hàng dự kiến" span={2}>
                  {formatDate(transport.scheduledPickupAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Timestamps */}
        <Divider orientation="left">Thông tin hệ thống</Divider>
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
          <Descriptions.Item label="Ngày tạo">
            {formatDate(record.createdDate || record.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {formatDate(record.modifiedDate || record.updatedAt) || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default HandoverRecordDetailPage;
