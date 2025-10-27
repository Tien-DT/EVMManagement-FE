// src/features/dealer-manager/pages/DealerManagerDepositsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Modal } from 'antd';
import { DollarCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const DealerManagerDepositsPage = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (user?.dealerId) {
      loadDeposits();
    }
  }, [user]);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      // Get all deposits and filter by dealer's orders
      const response = await axiosInstance.get(endpoints.deposits.getAll);
      console.log('Deposits loaded:', response);
      
      if (response.success && response.data) {
        const allDeposits = response.data.items || response.data || [];
        // Filter deposits for this dealer's orders
        const dealerDeposits = allDeposits.filter(d => d.order?.dealerId === user.dealerId);
        setDeposits(dealerDeposits);
      }
    } catch (error) {
      console.error('Error loading deposits:', error);
      message.error('Không thể tải danh sách đặt cọc');
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = (deposit) => {
    setSelectedDeposit(deposit);
    setPaymentModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedDeposit) return;
    
    setPaying(true);
    try {
      // Update deposit status to PAID
      await axiosInstance.patch(endpoints.deposits.update(selectedDeposit.id), {
        status: 'PAID',
      });

      // Update order status to IN_PROGRESS
      if (selectedDeposit.orderId) {
        const orderResponse = await axiosInstance.get(endpoints.orders.getById(selectedDeposit.orderId));
        if (orderResponse.success && orderResponse.data) {
          await axiosInstance.put(endpoints.orders.update(selectedDeposit.orderId), {
            ...orderResponse.data,
            status: 'IN_PROGRESS', // OrderStatus.IN_PROGRESS = 2
          });
        }
      }

      message.success('Đã thanh toán đặt cọc thành công!');
      setPaymentModalVisible(false);
      setSelectedDeposit(null);
      loadDeposits();
    } catch (error) {
      console.error('Error paying deposit:', error);
      message.error('Không thể thanh toán đặt cọc');
    } finally {
      setPaying(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: 'warning', text: 'Chờ thanh toán' },
      PAID: { color: 'success', text: 'Đã thanh toán' },
      REFUNDED: { color: 'default', text: 'Đã hoàn' },
      APPLIED_TO_ORDER: { color: 'processing', text: 'Đã áp dụng' },
    };
    const config = statusMap[status] || statusMap.PENDING;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getMethodText = (method) => {
    const methods = {
      BANK_TRANSFER: 'Chuyển khoản',
      CASH: 'Tiền mặt',
      CREDIT_CARD: 'Thẻ tín dụng',
    };
    return methods[method] || method;
  };

  const columns = [
    {
      title: 'Đơn hàng',
      dataIndex: ['order', 'code'],
      key: 'orderCode',
      width: 150,
      render: (text) => <span className="font-mono font-semibold">{text || 'N/A'}</span>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        </span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (method) => getMethodText(method),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePayDeposit(record)}
            >
              Thanh toán
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <DollarCircleOutlined className="text-xl" />
            <span>Đặt Cọc</span>
          </div>
        }
        extra={
          <Button onClick={loadDeposits} loading={loading}>
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={deposits}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} yêu cầu đặt cọc`,
          }}
        />
      </Card>

      {/* Payment Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Xác Nhận Thanh Toán</span>
          </div>
        }
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setSelectedDeposit(null);
        }}
        onOk={handleConfirmPayment}
        okText="Xác nhận đã thanh toán"
        cancelText="Hủy"
        confirmLoading={paying}
        width={600}
      >
        {selectedDeposit && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">Thông tin thanh toán</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Đơn hàng:</span>
                  <span className="font-semibold">{selectedDeposit.order?.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Số tiền:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedDeposit.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Phương thức:</span>
                  <span className="font-semibold">{getMethodText(selectedDeposit.method)}</span>
                </div>
                {selectedDeposit.note && (
                  <div className="pt-2 border-t border-green-200">
                    <span className="text-green-700">Ghi chú:</span>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedDeposit.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Sau khi xác nhận thanh toán, đơn hàng sẽ chuyển sang trạng thái "Đang xử lý".
                Vui lòng đảm bảo bạn đã thực hiện thanh toán trước khi xác nhận.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DealerManagerDepositsPage;
