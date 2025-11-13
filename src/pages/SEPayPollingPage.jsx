import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card, Progress, Alert, Image, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined, QrcodeOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';
import endpoints from '../api/endpoints';

const { Title, Text } = Typography;

const SEPayPollingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const pollingIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const maxPollingAttempts = 60; // 60 attempts * 5 seconds = 5 minutes

  useEffect(() => {
    const transactionCode = searchParams.get('transaction_code');
    const paymentUrl = searchParams.get('payment_url');
    
    if (!transactionCode) {
      setError('Không tìm thấy mã giao dịch');
      setLoading(false);
      return;
    }

    // Set QR code URL if provided
    if (paymentUrl) {
      setQrCodeUrl(decodeURIComponent(paymentUrl));
    }

    console.log('Starting payment polling for transaction:', transactionCode);
    startPolling(transactionCode);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [searchParams]);

  const startPolling = (transactionCode) => {
    // Check immediately
    checkPaymentStatus(transactionCode);

    // Then check every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkPaymentStatus(transactionCode);
    }, 5000);

    // Update progress bar every 100ms for smooth animation
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0; // Reset after 5 seconds
        return prev + (100 / 50); // 100% / (5000ms / 100ms) = 2% per 100ms
      });
    }, 100);
  };

  const checkPaymentStatus = async (transactionCode) => {
    try {
      console.log(`[Polling ${pollingCount + 1}/${maxPollingAttempts}] Checking payment status...`);
      
      const response = await axiosInstance.get(endpoints.payments.sepayCheckStatus(transactionCode));
      
      console.log('Payment status response:', response.data);

      const paymentData = response.data?.data || response.data;

      // Check if payment is successful
      if (paymentData?.success && paymentData?.responseCode === '00') {
        console.log('✅ Payment successful! Stopping polling...');
        stopPolling();
        setPaymentResult(paymentData);
        setLoading(false);

        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/dealer/orders');
        }, 3000);
        return;
      }

      // Check if payment failed
      if (paymentData?.responseCode && paymentData.responseCode !== '00' && paymentData.responseCode !== '01') {
        console.log('❌ Payment failed! Stopping polling...');
        stopPolling();
        setError(paymentData?.message || 'Thanh toán thất bại');
        setLoading(false);
        return;
      }

      // Payment still pending, increment counter
      setPollingCount((prev) => {
        const newCount = prev + 1;
        
        // Check if max attempts reached
        if (newCount >= maxPollingAttempts) {
          console.log('⏱️ Max polling attempts reached. Stopping...');
          stopPolling();
          setError('Hết thời gian chờ. Vui lòng kiểm tra lại trạng thái đơn hàng sau.');
          setLoading(false);
        }
        
        return newCount;
      });

    } catch (err) {
      console.error('Error checking payment status:', err);
      
      // Don't stop polling on error, just log it
      setPollingCount((prev) => {
        const newCount = prev + 1;
        
        if (newCount >= maxPollingAttempts) {
          stopPolling();
          setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi kiểm tra trạng thái thanh toán');
          setLoading(false);
        }
        
        return newCount;
      });
    }
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleBackToOrders = () => {
    navigate('/dealer/orders');
  };

  const handleRetryPolling = () => {
    const transactionCode = searchParams.get('transaction_code');
    if (transactionCode) {
      setLoading(true);
      setError(null);
      setPollingCount(0);
      setProgress(0);
      startPolling(transactionCode);
    }
  };

  if (loading) {
    const timeElapsed = pollingCount * 5;
    const timeRemaining = (maxPollingAttempts - pollingCount) * 5;

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        {/* QR Code Card */}
        {qrCodeUrl && (
          <Card 
            style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <QrcodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <span>Mã QR Thanh Toán</span>
              </div>
            }
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '16px'
            }}>
              <Image
                src={qrCodeUrl}
                alt="QR Code Payment"
                style={{ 
                  maxWidth: '300px',
                  border: '2px solid #e8e8e8',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#fff'
                }}
                preview={false}
              />
              <Text type="secondary">
                Quét mã QR này bằng ứng dụng ngân hàng để thanh toán
              </Text>
            </div>
          </Card>
        )}

        {/* Polling Status Card */}
        <Card style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <ClockCircleOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
          
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
            Đang chờ xác nhận thanh toán...
          </h2>
          
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            Vui lòng hoàn tất thanh toán trên ứng dụng ngân hàng của bạn
          </p>

          <div style={{ marginBottom: '24px' }}>
            <SyncOutlined spin style={{ fontSize: '48px', color: '#1890ff' }} />
          </div>

          <Progress 
            percent={progress} 
            showInfo={false} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            style={{ marginBottom: '16px' }}
          />

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '14px', 
            color: '#999',
            marginBottom: '24px'
          }}>
            <span>Lần kiểm tra: {pollingCount + 1}/{maxPollingAttempts}</span>
            <span>Thời gian: {timeElapsed}s / {maxPollingAttempts * 5}s</span>
          </div>

          <Alert
            message="Hướng dẫn thanh toán"
            description={
              <ul style={{ margin: 0, paddingLeft: 20, textAlign: 'left' }}>
                <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                <li>Quét mã QR hoặc chuyển khoản theo thông tin đã cung cấp</li>
                <li>Nhập đúng nội dung chuyển khoản</li>
                <li>Hệ thống sẽ tự động xác nhận sau khi nhận được tiền</li>
              </ul>
            }
            type="info"
            showIcon
          />

          <div style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
            <p style={{ margin: 0 }}>
              💡 Trang này sẽ tự động cập nhật khi thanh toán thành công
            </p>
            <p style={{ margin: '8px 0 0 0' }}>
              ⏱️ Còn lại: {Math.floor(timeRemaining / 60)} phút {timeRemaining % 60} giây
            </p>
          </div>
        </Card>
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
        padding: '24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Card style={{ maxWidth: 600, width: '100%' }}>
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Chưa nhận được xác nhận thanh toán"
            subTitle={error}
            extra={[
              <Button type="default" key="retry" onClick={handleRetryPolling} icon={<SyncOutlined />}>
                Kiểm tra lại
              </Button>,
              <Button type="primary" key="back" onClick={handleBackToOrders}>
                Quay lại danh sách đơn hàng
              </Button>,
            ]}
          >
            <Alert
              message="Lưu ý"
              description="Nếu bạn đã thanh toán, giao dịch có thể đang được xử lý. Vui lòng kiểm tra lại sau vài phút hoặc xem trong danh sách đơn hàng."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Result>
        </Card>
      </div>
    );
  }

  const isSuccess = paymentResult?.success && paymentResult?.responseCode === '00';

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
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
          title="Thanh toán thành công!"
          subTitle={paymentResult?.message || "Đơn hàng của bạn đã được thanh toán thành công"}
        />

        <div style={{ 
          marginTop: 24, 
          padding: '16px', 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#52c41a', fontWeight: 600, fontSize: '18px' }}>
            ✓ Đơn hàng đã được xác nhận
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            Số tiền: <strong>{paymentResult?.amount?.toLocaleString('vi-VN')} ₫</strong>
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            Mã giao dịch: <strong>{paymentResult?.transactionCode}</strong>
          </p>
        </div>

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

        <div style={{ 
          marginTop: 16, 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#999' 
        }}>
          <p style={{ margin: 0 }}>
            🎉 Bạn sẽ được tự động chuyển về danh sách đơn hàng sau 3 giây
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SEPayPollingPage;
