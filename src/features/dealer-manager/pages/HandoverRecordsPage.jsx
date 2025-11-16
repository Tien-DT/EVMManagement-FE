import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Input, Tag, Button, Space, Spin, Empty, Breadcrumb } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  SearchOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

const { Search } = Input;

const HandoverRecordsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dealerId, setDealerId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get dealerId from user context or localStorage
  useEffect(() => {
    if (user?.dealerId) {
      setDealerId(user.dealerId);
    } else {
      // Fallback to localStorage
      const userProfileStr = localStorage.getItem('userProfile');
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          if (userProfile.dealerId) {
            setDealerId(userProfile.dealerId);
          }
        } catch (err) {
          console.error('Error parsing userProfile:', err);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (dealerId) {
      fetchRecords();
    }
  }, [dealerId, pagination.current, pagination.pageSize]);

  const fetchRecords = async () => {
    if (!dealerId) {
      console.log('No dealerId available');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.handoverRecords.lookup, {
        params: {
          dealerId: dealerId,
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
        },
      });

      const data = response.data;
      setRecords(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.totalCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching handover records:', error);
      showError('Không thể tải danh sách bàn giao xe');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      record.order?.code?.toLowerCase().includes(lowerSearch) ||
      record.transport?.providerName?.toLowerCase().includes(lowerSearch)
    );
  });

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: ['order', 'code'],
      key: 'orderCode',
      width: 200,
      render: (code) => <span className="font-mono text-blue-600">{code || '-'}</span>,
    },
    {
      title: 'Nhà vận chuyển',
      dataIndex: ['transport', 'providerName'],
      key: 'providerName',
      width: 150,
      render: (name) => name || '-',
    },
    {
      title: 'Ngày bàn giao',
      dataIndex: 'handoverDate',
      key: 'handoverDate',
      width: 150,
      render: (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isAccepted',
      key: 'isAccepted',
      width: 130,
      render: (isAccepted) => {
        if (isAccepted === true) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Đã xác nhận
            </Tag>
          );
        } else if (isAccepted === false) {
          return (
            <Tag icon={<ClockCircleOutlined />} color="warning">
              Chưa xác nhận
            </Tag>
          );
        }
        return <Tag color="default">Chưa rõ</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer-manager/handover-records/${record.id}`)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FileTextOutlined />
          <span style={{ marginLeft: 8 }}>Bàn giao xe</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, marginBottom: 16, fontSize: 24, fontWeight: 600 }}>
            Danh sách bàn giao xe
          </h2>

          <Search
            placeholder="Tìm kiếm theo mã đơn hàng, nhà vận chuyển..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 500 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <Empty 
            description={searchTerm ? 'Không tìm thấy bàn giao xe phù hợp' : 'Chưa có bàn giao xe nào'}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
    </div>
  );
};

export default HandoverRecordsPage;
