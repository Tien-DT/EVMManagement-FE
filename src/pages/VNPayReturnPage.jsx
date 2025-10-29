import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';
import endpoints from '../api/endpoints';

const VNPayReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Get all query parameters from VNPay
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        console.log('VNPay return params:', params);

        // Call backend to verify payment
        const response = await axiosInstance.get(endpoints.payments.vnpayReturn, {
          params: params
        });

        console.log('Payment verification response:', response);
        console.log('Response data:', response.data);

        // axiosInstance already unwraps the response, so response.data is the actual data
        // Check if it's the payment result directly or wrapped in data property
        const paymentData = response.data?.data || response.data;

        console.log('Payment data:', paymentData);

        if (paymentData?.success) {
          console.log('Setting payment result to:', paymentData);
          setPaymentResult(paymentData);

          // Auto redirect to orders page after 3 seconds
          setTimeout(() => {
            navigate('/dealer/orders');
          }, 3000);
        } else {
          console.error('Payment verification failed:', paymentData);
          setError(paymentData?.message || 'Xác thực thanh toán thất bại');
        }
      } catch (err) {
        console.error('Error processing payment return:', err);
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response?.data);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams, navigate]);

  const handleBackToOrders = () => {
    navigate('/dealer/orders');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <p style={{ fontSize: '16px', color: '#666' }}>Đang xử lý kết quả thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '24px'
      }}>
        <Card style={{ maxWidth: 600, width: '100%' }}>
          <Result
            status="error"
            title="Thanh toán thất bại"
            subTitle={error}
            extra={[
              <Button type="primary" key="back" onClick={handleBackToOrders}>
                Quay lại danh sách đơn hàng
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  console.log('Payment result state:', paymentResult);
  console.log('Is success check:', paymentResult?.success, paymentResult?.responseCode);

  const isSuccess = paymentResult?.success && paymentResult?.responseCode === '00';

  console.log('Final isSuccess:', isSuccess);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Card style={{ maxWidth: 700, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Result
          status={isSuccess ? "success" : "error"}
          icon={isSuccess ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          title={isSuccess ? "Đặt cọc thành công!" : "Thanh toán thất bại"}
          subTitle={paymentResult?.message || (isSuccess ? "Đơn hàng của bạn đã được đặt cọc thành công" : "Có lỗi xảy ra trong quá trình thanh toán")}
        />

        {paymentResult && (
          <Descriptions 
            bordered 
            column={1} 
            size="small"
            style={{ marginTop: 24 }}
          >
            <Descriptions.Item label="Mã giao dịch">
              <strong>{paymentResult.transactionCode}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã giao dịch VNPay">
              {paymentResult.vnpayTransactionNo || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <span style={{ fontSize: '16px', fontWeight: 600, color: isSuccess ? '#52c41a' : '#ff4d4f' }}>
                {paymentResult.amount?.toLocaleString('vi-VN')} ₫
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngân hàng">
              {paymentResult.bankCode || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Loại thẻ">
              {paymentResult.cardType || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {paymentResult.payDate ? new Date(paymentResult.payDate).toLocaleString('vi-VN') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              {paymentResult.orderInfo || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handleBackToOrders}
            style={{ minWidth: 200 }}
          >
            Quay lại danh sách đơn hàng
          </Button>
        </div>

        {isSuccess && (
          <div style={{ 
            marginTop: 24, 
            padding: '16px', 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0, color: '#52c41a', fontWeight: 500 }}>
              ✓ Đơn hàng đã được xác nhận
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
              Bạn có thể theo dõi trạng thái đơn hàng trong danh sách đơn hàng
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VNPayReturnPage;

