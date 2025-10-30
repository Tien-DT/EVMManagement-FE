// src/features/dealer-manager/pages/DealerManagerQuotationsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Space,
  message,
  Tag,
  Spin,
  Input,
  Select,
  Typography,
} from 'antd';
import {
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useDealerManagerQuotations } from '../hooks/useDealerManagerQuotations';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const DealerManagerQuotationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { quotations, isLoading, error } = useDealerManagerQuotations();

  const statusConfig = {
    DRAFT: {
      color: 'default',
      text: 'Bản nháp',
      icon: <FileTextOutlined />,
    },
    SENT: {
      color: 'processing',
      text: 'Đã gửi',
      icon: <ClockCircleOutlined />,
    },
    APPROVED: {
      color: 'success',
      text: 'Đã duyệt',
      icon: <CheckCircleOutlined />,
    },
    REJECTED: {
      color: 'error',
      text: 'Bị từ chối',
      icon: <CloseCircleOutlined />,
    },
    EXPIRED: {
      color: 'warning',
      text: 'Hết hạn',
      icon: <ExclamationCircleOutlined />,
    },
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusTag = (status) => {
    const upperStatus = status?.toUpperCase() || 'DRAFT';
    const config = statusConfig[upperStatus] || statusConfig.DRAFT;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const filteredQuotations = quotations?.filter((quotation) => {
    const matchesSearch =
      quotation.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'ALL' ||
      quotation.status?.toUpperCase() === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const columns = [
    {
      title: 'Mã báo giá',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left',
      render: (text) => (
        <Text strong style={{ color: '#1890ff', fontSize: '13px' }}>
          {text || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 300,
      ellipsis: true,
      render: (text) => <Text>{text || '-'}</Text>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 130,
      render: (date) => (
        <Text style={{ fontSize: '13px' }}>
          {date ? moment(date).format('DD/MM/YYYY') : '-'}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer/quotations/${record.id}`)}
            size="small"
            title="Xem chi tiết"
            style={{ color: '#1890ff' }}
          />
        </Space>
      ),
    },
  ];

  if (error) {
    message.error('Lỗi khi tải danh sách báo giá');
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card
        bordered={false}
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              Danh sách báo giá
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
              Quản lý các báo giá từ EVM
            </Text>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card size="small">
          <Text type="secondary">Tổng báo giá</Text>
          <Title level={4} style={{ margin: '8px 0 0 0' }}>
            {quotations?.length || 0}
          </Title>
        </Card>
        <Card size="small">
          <Text type="secondary">Đã gửi</Text>
          <Title level={4} style={{ margin: '8px 0 0 0', color: '#1890ff' }}>
            {quotations?.filter((q) => q.status?.toUpperCase() === 'SENT').length || 0}
          </Title>
        </Card>
        <Card size="small">
          <Text type="secondary">Đã duyệt</Text>
          <Title level={4} style={{ margin: '8px 0 0 0', color: '#52c41a' }}>
            {quotations?.filter((q) => q.status?.toUpperCase() === 'APPROVED').length || 0}
          </Title>
        </Card>
        <Card size="small">
          <Text type="secondary">Bị từ chối</Text>
          <Title level={4} style={{ margin: '8px 0 0 0', color: '#ff4d4f' }}>
            {quotations?.filter((q) => q.status?.toUpperCase() === 'REJECTED').length || 0}
          </Title>
        </Card>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Input
            placeholder="Tìm kiếm theo mã hoặc ghi chú..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            style={{ width: 180 }}
          >
            <Option value="ALL">Tất cả trạng thái</Option>
            <Option value="DRAFT">Bản nháp</Option>
            <Option value="SENT">Đã gửi</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Bị từ chối</Option>
            <Option value="EXPIRED">Hết hạn</Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: '12px' }}>
        <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
          Hiển thị {filteredQuotations.length} / {quotations?.length || 0} báo giá
        </Text>
        <Table
          columns={columns}
          dataSource={filteredQuotations}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} báo giá`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <p style={{ marginTop: '16px', color: '#999' }}>
                  Không có báo giá nào
                </p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default DealerManagerQuotationsPage;
