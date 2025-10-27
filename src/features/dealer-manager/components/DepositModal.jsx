import React, { useState } from 'react';
import { Modal, Button, Spin, message, Descriptions, Alert } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const DepositModal = ({ visible, order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  // Deposit amount is 10% of total amount (same as displayed in the table)
  const depositAmount = order.totalAmount ? order.totalAmount * 0.1 : 0;

  // Remaining amount after this deposit
  const remainingAmount = order.totalAmount ? order.totalAmount - depositAmount : 0;

  // VNPay minimum amount is 10,000 VND
  const VNPAY_MIN_AMOUNT = 10000;

  const handleDeposit = async () => {
    // Validate minimum amount
    if (depositAmount < VNPAY_MIN_AMOUNT) {
      message.error(`Số tiền đặt cọc tối thiểu là ${VNPAY_MIN_AMOUNT.toLocaleString('vi-VN')} ₫. Số tiền đặt cọc hiện tại: ${depositAmount.toLocaleString('vi-VN')} ₫`);
      return;
    }

    console.log('Order data:', order);
    console.log('Deposit amount:', depositAmount);

    setLoading(true);
    try {
      // Call VNPay API to create payment URL
      const response = await axiosInstance.post(endpoints.payments.vnpayCreate, {
        orderId: order.id,
        amount: depositAmount,
        orderInfo: `Đặt cọc 10% cho đơn hàng ${order.code}`,
        isDeposit: true,
        locale: 'vn'
      });

      console.log('VNPay create payment response:', response.data);

      // Check if response has paymentUrl (could be in data.data or data directly)
      const paymentUrl = response.data?.data?.paymentUrl || response.data?.paymentUrl;

      if (paymentUrl) {
        message.success('Đang chuyển đến trang thanh toán VNPay...', 1);

        // Wait a bit for message to show, then redirect
        setTimeout(() => {
          console.log('Redirecting to:', paymentUrl);
          window.location.href = paymentUrl;
        }, 500);
      } else {
        setLoading(false);
        console.error('No payment URL found in response:', response.data);
        throw new Error('Không tìm thấy link thanh toán trong response');
      }
    } catch (error) {
      console.error('Error creating deposit payment:', error);
      message.error(error.response?.data?.message || error.message || 'Không thể tạo thanh toán đặt cọc');
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarCircleOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
          <span>Đặt cọc đơn hàng</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleDeposit}
          icon={<DollarCircleOutlined />}
          style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
        >
          Thanh toán qua VNPay
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loading}>
        <Alert
          message="Thông tin đặt cọc"
          description="Bạn cần đặt cọc 10% giá trị đơn hàng để xác nhận đơn hàng. Thanh toán sẽ được thực hiện qua cổng thanh toán VNPay."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Mã đơn hàng">
            <strong>{order.code}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              {order.totalAmount?.toLocaleString('vi-VN')} ₫
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền đặt cọc (10%)">
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#fa8c16' }}>
              {depositAmount.toLocaleString('vi-VN')} ₫
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền còn lại">
            <span style={{ fontSize: '16px', color: '#52c41a' }}>
              {remainingAmount.toLocaleString('vi-VN')} ₫
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Alert
          message="Lưu ý"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Sau khi đặt cọc thành công, đơn hàng sẽ được xác nhận</li>
              <li>Số tiền còn lại sẽ được thanh toán khi nhận xe</li>
              <li>Bạn sẽ được chuyển đến trang thanh toán VNPay Sandbox (test)</li>
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Spin>
    </Modal>
  );
};

export default DepositModal;

