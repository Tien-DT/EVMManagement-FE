// src/features/dealer-manager/pages/DealerManagerQuotationDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { id } = useParams();
  const { getQuotationById } = useDealerManagerQuotations();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

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
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
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

      const response = await axiosInstance.put(
        endpoints.quotations.update(id),
        requestBody
      );

      if (response.success || response.data) {
        message.success('Đã chấp nhận báo giá thành công!');
        // Reload quotation to get updated data
        const updatedData = await getQuotationById(id);
        setQuotation(updatedData);
      } else {
        throw new Error('Không thể chấp nhận báo giá');
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      message.error('Lỗi khi chấp nhận báo giá: ' + (error.response?.data?.message || error.message));
    } finally {
      setAccepting(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      DRAFT: { color: 'default', text: 'Bản nháp', icon: <FileTextOutlined /> },
      SENT: { color: 'processing', text: 'Đã gửi', icon: <ClockCircleOutlined /> },
      ACCEPTED: { color: 'success', text: 'Đã chấp nhận', icon: <CheckCircleOutlined /> },
      APPROVED: { color: 'success', text: 'Đã duyệt', icon: <CheckCircleOutlined /> },
      REJECTED: { color: 'error', text: 'Bị từ chối', icon: <CloseCircleOutlined /> },
      EXPIRED: { color: 'warning', text: 'Hết hạn', icon: <ExclamationCircleOutlined /> },
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

  // Tính tổng giảm giá từ tất cả các dòng
  const totalDiscount = quotationDetails.reduce((sum, record) => {
    const discountPercent = record.discountPercent || 0;
    const unitPrice = record.unitPrice || 0;
    const quantity = record.quantity || 0;
    if (discountPercent > 0) {
      const discountAmount = (discountPercent * unitPrice) / 100 * quantity;
      return sum + discountAmount;
    }
    return sum;
  }, 0);

  const columns = [
    {
      title: 'Biến thể',
      key: 'variant',
      width: 250,
      render: (_, record) => {
        const modelName = record.vehicleModelName || record.vehicleVariant?.vehicleModel?.name || '';
        const color = record.vehicleVariantColor || record.vehicleVariant?.color || '';
        const variantText = modelName && color ? `${modelName} (${color})` : modelName || color || '-';
        return (
          <Space>
            <CarOutlined style={{ color: '#1890ff' }} />
            <Text strong>{variantText}</Text>
          </Space>
        );
      },
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
      key: 'discount',
      width: 150,
      align: 'right',
      render: (_, record) => {
        const discountPercent = record.discountPercent || null;
        const unitPrice = record.unitPrice || 0;
        const quantity = record.quantity || 0;
        if (discountPercent !== null && discountPercent !== undefined && discountPercent > 0) {
          // Tính giảm giá = (discountPercent * unitPrice / 100) * quantity
          const discountAmount = (discountPercent * unitPrice) / 100 * quantity;
          return (
            <Text style={{ color: '#ff4d4f' }}>
              {formatCurrency(discountAmount)}
            </Text>
          );
        }
        return <Text>-</Text>;
      },
    },
    {
      title: 'Tổng phụ',
      key: 'lineTotal',
      width: 150,
      align: 'right',
      render: (_, record) => {
        const lineTotal = record.lineTotal || record.subTotal || 0;
        return (
          <Text strong style={{ color: '#1890ff' }}>
            {formatCurrency(lineTotal)}
          </Text>
        );
      },
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
                  {totalDiscount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong style={{ fontSize: '16px' }}>Tổng giảm giá:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                          {formatCurrency(totalDiscount)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <Text strong style={{ fontSize: '16px' }}>Tổng phụ:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                        {formatCurrency(quotation.subtotal || 0)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {quotation.tax && quotation.tax > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong style={{ fontSize: '16px' }}>Thuế:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <Text strong style={{ fontSize: '16px', color: '#722ed1' }}>
                          {formatCurrency(quotation.tax)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                        {formatCurrency(quotation.total || 0)}
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
                <Space direction="vertical" size={8}>
                  {totalDiscount > 0 && (
                    <Space direction="vertical" size={2}>
                      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                        Tổng giảm giá
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500 }}>
                        {formatCurrency(totalDiscount)}
                      </Text>
                    </Space>
                  )}
                  <Space direction="vertical" size={2}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                      Tổng phụ
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500 }}>
                      {formatCurrency(quotation.subtotal || 0)}
                    </Text>
                  </Space>
                  {quotation.tax && quotation.tax > 0 && (
                    <Space direction="vertical" size={2}>
                      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                        Thuế
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500 }}>
                        {formatCurrency(quotation.tax)}
                      </Text>
                    </Space>
                  )}
                  <Space direction="vertical" size={2}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                      Tổng giá trị báo giá
                    </Text>
                    <Title level={2} style={{ color: 'white', margin: 0 }}>
                      <DollarCircleOutlined /> {formatCurrency(quotation.total || 0)}
                    </Title>
                  </Space>
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
