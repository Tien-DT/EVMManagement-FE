// src/features/evm-staff/components/DigitalSignatureModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Input, Alert, Spin, Typography, Space, Divider } from "antd";
import {
  SafetyOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import useDigitalSignature from "../hooks/useDigitalSignature";

const { Text, Title } = Typography;

/**
 * Modal xử lý Digital Signature cho EVM Staff
 * @param {boolean} visible - Hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onSuccess - Callback khi ký thành công
 * @param {string} documentType - Loại tài liệu: "Contract", "HandoverRecord", "DealerContract"
 * @param {string} documentId - ID của tài liệu
 * @param {string} signerEmail - Email người ký
 * @param {string} documentName - Tên tài liệu (hiển thị)
 */
const DigitalSignatureModal = ({
  visible,
  onClose,
  onSuccess,
  documentType,
  documentId,
  signerEmail,
  documentName = "Tài liệu",
}) => {
  const {
    isLoading,
    error,
    otpRequested,
    otpVerified,
    currentStep,
    requestOtp,
    verifyOtp,
    completeSignature,
    reset,
  } = useDigitalSignature();

  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer cho OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && otpRequested) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, otpRequested]);

  // Reset khi đóng modal
  useEffect(() => {
    if (!visible) {
      reset();
      setOtpCode("");
      setCountdown(0);
      setCanResend(false);
    }
  }, [visible, reset]);

  /**
   * Xử lý request OTP
   */
  const handleRequestOtp = useCallback(async () => {
    const result = await requestOtp(documentType, documentId, signerEmail);
    if (result.success) {
      setCountdown(300); // 5 phút
      setCanResend(false);
    }
  }, [requestOtp, documentType, documentId, signerEmail]);

  /**
   * Xử lý verify OTP và hoàn tất chữ ký
   */
  const handleVerifyAndSign = useCallback(async () => {
    if (!otpCode || otpCode.length < 6) {
      return;
    }

    // Verify OTP
    const verifyResult = await verifyOtp(documentId, otpCode, documentType);
    if (!verifyResult.success) {
      return;
    }

    // Complete signature
    const completeResult = await completeSignature(documentId, documentType);
    if (completeResult.success) {
      onSuccess?.(completeResult.data);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [otpCode, documentId, documentType, verifyOtp, completeSignature, onSuccess, onClose]);

  /**
   * Format thời gian countdown
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Render nội dung theo bước
   */
  const renderContent = () => {
    // Bước 0: Chưa bắt đầu
    if (currentStep === "idle") {
      return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="Xác thực chữ ký điện tử"
            description={
              <div>
                <p>Bạn sắp ký: <strong>{documentName}</strong></p>
                <p>Mã OTP sẽ được gửi đến email: <strong>{signerEmail}</strong></p>
                <p>Vui lòng kiểm tra hộp thư và nhập mã OTP để xác thực chữ ký.</p>
              </div>
            }
            type="info"
            icon={<SafetyOutlined />}
            showIcon
          />
          <Button
            type="primary"
            size="large"
            block
            icon={<MailOutlined />}
            loading={isLoading}
            onClick={handleRequestOtp}
          >
            Gửi mã OTP
          </Button>
        </Space>
      );
    }

    // Bước 1: OTP đã gửi, chờ nhập
    if (currentStep === "otp_requested" && !otpVerified) {
      return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="Mã OTP đã được gửi"
            description={`Vui lòng kiểm tra email ${signerEmail} và nhập mã OTP bên dưới.`}
            type="success"
            icon={<MailOutlined />}
            showIcon
          />

          <div>
            <Text strong>Nhập mã OTP (6 số)</Text>
            <Input
              placeholder="Nhập mã OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              size="large"
              maxLength={6}
              style={{ marginTop: 8, textAlign: "center", fontSize: 20, letterSpacing: 5 }}
              autoFocus
            />
          </div>

          {countdown > 0 && (
            <Alert
              message={
                <Space>
                  <ClockCircleOutlined />
                  <Text>Mã OTP có hiệu lực trong: <strong>{formatTime(countdown)}</strong></Text>
                </Space>
              }
              type="warning"
              showIcon={false}
            />
          )}

          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              disabled={!canResend}
              loading={isLoading}
              onClick={handleRequestOtp}
            >
              {canResend ? "Gửi lại OTP" : `Gửi lại sau ${formatTime(countdown)}`}
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={otpCode.length !== 6}
              loading={isLoading}
              onClick={handleVerifyAndSign}
            >
              Xác nhận và Ký
            </Button>
          </Space>
        </Space>
      );
    }

    // Bước 2: Hoàn tất
    if (currentStep === "completed") {
      return (
        <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
          <CheckCircleOutlined style={{ fontSize: 72, color: "#52c41a" }} />
          <Title level={4} style={{ margin: 0 }}>
            Ký tài liệu thành công!
          </Title>
          <Text type="secondary">
            Tài liệu đã được ký điện tử và lưu vào hệ thống.
          </Text>
        </Space>
      );
    }

    return null;
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          Chữ ký số điện tử - EVM Staff
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      maskClosable={false}
    >
      <Spin spinning={isLoading}>
        <div style={{ padding: "24px 0" }}>
          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              closable
              style={{ marginBottom: 24 }}
              showIcon
            />
          )}

          {renderContent()}

          <Divider />

          <Alert
            message="Lưu ý"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Mã OTP có hiệu lực trong 5 phút</li>
                <li>Không chia sẻ mã OTP với bất kỳ ai</li>
                <li>Chữ ký điện tử có giá trị pháp lý</li>
              </ul>
            }
            type="info"
            showIcon={false}
            style={{ backgroundColor: "#f0f5ff", border: "1px solid #adc6ff" }}
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default DigitalSignatureModal;

