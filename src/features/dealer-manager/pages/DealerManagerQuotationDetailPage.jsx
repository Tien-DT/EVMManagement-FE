// src/features/dealer-manager/pages/DealerManagerQuotationDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Spin,
  message,
  Tag,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined,
  CarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useDealerManagerQuotations } from '../hooks/useDealerManagerQuotations';
import moment from 'moment';

const { Title, Text } = Typography;

const DealerManagerQuotationDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { getQuotationById } = useDealerManagerQuotations();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Get orderId from navigation state if available
  useEffect(() => {
    if (location.state?.orderId) {
      setOrderId(location.state.orderId);
      console.log('Received orderId from navigation:', location.state.orderId);
    }
  }, [location.state]);

  useEffect(() => {
    const loadQuotation = async () => {
      setLoading(true);
      try {
        const data = await getQuotationById(id);
        console.log('Quotation loaded:', data);
        if (data) {
          setQuotation(data);
        } else {
          console.error('No quotation data received');
          message.error('Không tìm thấy báo giá');
        }
      } catch (error) {
        console.error('Error loading quotation:', error);
        message.error('Không thể tải thông tin báo giá');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadQuotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id to avoid infinite loop

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAcceptQuotation = async () => {
    if (!quotation) return;

    setAccepting(true);
    try {
      // Build request body with all non-null fields
      const requestBody = {
        code: quotation.code,
        status: 'ACCEPTED', // Change status to ACCEPTED
      };

      // Add optional fields only if they exist
      if (quotation.customerId) {
        requestBody.customerId = quotation.customerId;
      }
      if (quotation.note) {
        requestBody.note = quotation.note;
      }
      if (quotation.validUntil) {
        requestBody.validUntil = quotation.validUntil;
      }
      if (quotation.quotationDetails && quotation.quotationDetails.length > 0) {
        requestBody.quotationDetails = quotation.quotationDetails.map(detail => ({
          id: detail.id,
          vehicleVariantId: detail.vehicleVariantId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          discount: detail.discount || 0,
          note: detail.note || '',
        }));
      }

      console.log('Accept quotation request:', requestBody);

      const axiosInstance = (await import('../../../api/axiosInstance')).default;
      const endpoints = (await import('../../../api/endpoints')).default;

      // Update quotation status
      const response = await axiosInstance.put(
        endpoints.quotations.update(id),
        requestBody
      );

      if (response.success || response.data) {
        message.success('Đã chấp nhận báo giá thành công!');
        
        // Update order status if orderId is available (from navigation state or quotation)
        const orderIdToUpdate = orderId || quotation.orderId || quotation.order?.id;
        if (orderIdToUpdate) {
          try {
            console.log('Updating order status for orderId:', orderIdToUpdate);
            
            // Get order details
            const orderResponse = await axiosInstance.get(
              endpoints.orders.getById(orderIdToUpdate)
            );
            const order = orderResponse.data?.data || orderResponse.data;
            
            if (order) {
              // Build order update payload
              const orderUpdateData = {
                code: order.code,
                dealerId: order.dealerId,
                status: 'QUOTATION_ACCEPTED',
                quotationId: id,
                orderType: order.orderType,
              };
              
              // Add optional fields if they exist
              if (order.customerId) orderUpdateData.customerId = order.customerId;
              if (order.handoverRecordId) orderUpdateData.handoverRecordId = order.handoverRecordId;
              if (order.contractId) orderUpdateData.contractId = order.contractId;
              if (order.depositId) orderUpdateData.depositId = order.depositId;
              if (order.note) orderUpdateData.note = order.note;
              if (order.totalAmount) orderUpdateData.totalAmount = order.totalAmount;
              if (order.discountAmount) orderUpdateData.discountAmount = order.discountAmount;
              if (order.finalAmount) orderUpdateData.finalAmount = order.finalAmount;
              if (order.handoverDate) orderUpdateData.handoverDate = order.handoverDate;
              if (order.expectedDeliveryAt) orderUpdateData.expectedDeliveryAt = order.expectedDeliveryAt;
              
              console.log('Order update payload:', orderUpdateData);
              
              // Update order
              await axiosInstance.put(
                endpoints.orders.update(orderIdToUpdate),
                orderUpdateData
              );
              
              console.log('Order status updated to QUOTATION_ACCEPTED');
              message.success('Đã cập nhật trạng thái đơn hàng thành công!');
            }
          } catch (orderError) {
            console.error('Error updating order status:', orderError);
            message.warning('Báo giá đã được chấp nhận nhưng không thể cập nhật trạng thái đơn hàng');
          }
        }
        
        // Wait 3 seconds then navigate to orders page
        message.info('Đang chuyển về trang đơn hàng...', 2);
        setTimeout(() => {
          navigate('/dealer/orders');
        }, 3000);
      } else {
        throw new Error('Không thể chấp nhận báo giá');
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      message.error('Lỗi khi chấp nhận báo giá: ' + (error.response?.data?.message || error.message));
      setAccepting(false);
    }
    // Don't set accepting to false here, let navigation happen
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      DRAFT: { color: 'default', text: 'Bản nháp', icon: <FileTextOutlined /> },
      SENT: { color: 'processing', text: 'Đã gửi', icon: <ClockCircleOutlined /> },
      ACCEPTED: { color: 'success', text: 'Đã chấp nhận', icon: <CheckCircleOutlined /> },
      REJECTED: { color: 'error', text: 'Bị từ chối', icon: <CloseCircleOutlined /> },
      CONVERTED_TO_ORDER: { color: 'cyan', text: 'Đã chuyển thành đơn hàng', icon: <CheckCircleOutlined /> },
    };

    const upperStatus = status?.toUpperCase() || 'DRAFT';
    const config = statusConfig[upperStatus] || statusConfig.DRAFT;

    return (
      <Tag color={config.color} icon={config.icon} style={{ padding: '4px 12px', fontSize: '14px' }}>
        {config.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px', color: '#666' }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <ExclamationCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
        <Title level={4} style={{ marginTop: '16px' }}>
          Không tìm thấy báo giá
        </Title>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dealer/quotations')}
          style={{ marginTop: '16px' }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const quotationDetails = quotation.quotationDetails || [];

  const columns = [
    {
      title: 'Mẫu xe',
      key: 'vehicleModel',
      width: 200,
      render: (_, record) => (
        <Space>
          <CarOutlined style={{ color: '#1890ff' }} />
          <Text strong>{record.vehicleVariant?.vehicleModel?.name || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Biến thể',
      dataIndex: ['vehicleVariant', 'color'],
      key: 'color',
      width: 150,
      render: (text) => <Text>{text || '-'}</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (value) => <Text strong>{value || 0}</Text>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#52c41a', fontWeight: 600 }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#ff4d4f' }}>
          {value ? formatCurrency(value) : '-'}
        </Text>
      ),
    },
    {
      title: 'Thuế',
      dataIndex: 'tax',
      key: 'tax',
      width: 120,
      align: 'right',
      render: (value) => <Text>{value ? formatCurrency(value) : '-'}</Text>,
    },
    {
      title: 'Tổng phụ',
      dataIndex: 'subTotal',
      key: 'subTotal',
      width: 150,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card
        bordered={false}
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết báo giá: <span style={{ color: '#1890ff' }}>{quotation.code}</span>
            </Title>
            {getStatusTag(quotation.status)}
          </Space>
          <Space>
            {quotation.status === 'SENT' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={accepting}
                onClick={handleAcceptQuotation}
                style={{
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  opacity: 1,
                  fontWeight: 500,
                }}
              >
                Chấp nhận báo giá
              </Button>
            )}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dealer/quotations')}
            >
              Quay lại
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Basic Info */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <Text strong>Thông tin cơ bản</Text>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Mã báo giá">
                <Text strong style={{ color: '#1890ff' }}>{quotation.code || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(quotation.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {quotation.createdDate
                  ? moment(quotation.createdDate).format('DD/MM/YYYY HH:mm')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {quotation.modifiedDate
                  ? moment(quotation.modifiedDate).format('DD/MM/YYYY HH:mm')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {quotation.note || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Order Info */}
        {quotation.order && (
          <Col span={24}>
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Thông tin đơn hàng</Text>
                </Space>
              }
              bordered={false}
              style={{ borderRadius: '12px' }}
            >
              <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>{quotation.order.code || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái đơn">
                  <Tag color="blue">{quotation.order.status || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo đơn">
                  {quotation.order.createdDate
                    ? moment(quotation.order.createdDate).format('DD/MM/YYYY')
                    : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Quotation Details Table */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <CarOutlined style={{ color: '#722ed1' }} />
                <Text strong>Chi tiết sản phẩm</Text>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <Table
              columns={columns}
              dataSource={quotationDetails}
              rowKey={(record) => record.id}
              pagination={false}
              scroll={{ x: 1000 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6} align="right">
                      <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                        {formatCurrency(quotation.total)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>

        {/* Summary Card */}
        <Col span={24}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Space direction="vertical" size={4}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                    Tổng giá trị báo giá
                  </Text>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>
                    <DollarCircleOutlined /> {formatCurrency(quotation.total)}
                  </Title>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" size={4}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                    Số sản phẩm
                  </Text>
                  <Title level={3} style={{ color: 'white', margin: 0 }}>
                    {quotationDetails.length} mặt hàng
                  </Title>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DealerManagerQuotationDetailPage;
