import React, { useState, useEffect } from "react";
import { Modal, Form, Radio, Input, InputNumber, Button, message, Descriptions, Alert } from "antd";
import { DollarOutlined, CreditCardOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { orderService } from "../services/orderService";

const { TextArea } = Input;

const RemainingPaymentModal = ({ visible, onClose, order, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (visible && order) {
      calculatePaymentInfo();
    }
  }, [visible, order]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setPaymentInfo(null);
    }
  }, [visible, form]);

  const calculatePaymentInfo = () => {
    if (!order) return;

    const totalAmount = order.finalAmount || 0;
    const depositAmount = order.deposits?.reduce((sum, d) => {
      if (d.status === 1) { // PAID
        return sum + (d.amount || 0);
      }
      return sum;
    }, 0) || 0;

    const remainingAmount = totalAmount - depositAmount;
    const additionalFees = 0; // Có thể thêm phí khác ở đây

    setPaymentInfo({
      totalAmount,
      depositAmount,
      remainingAmount,
      additionalFees,
      finalPayment: remainingAmount + additionalFees,
    });
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);

      const values = form.getFieldsValue();
      
      const paymentData = {
        method: values.method,
        transactionReference: values.transactionReference || null,
        note: values.note || `Remaining payment for order ${order.code}`,
      };

      console.log("Submitting remaining payment:", paymentData);
      
      const response = await orderService.createRemainingPayment(order.id, paymentData);
      
      if (response.data && response.data.success) {
        message.success("Thanh toán thành công! Đơn hàng đã sẵn sàng bàn giao.");
        onSuccess && onSuccess(response.data);
        onClose();
      } else {
        throw new Error(response.data?.message || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi thanh toán";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div style={{ fontSize: 20, fontWeight: 600 }}>
          <DollarOutlined style={{ marginRight: 8, color: "#52c41a" }} />
          Thanh toán phần còn lại
        </div>
      }
    >
      {paymentInfo && (
        <div>
          <Alert
            message="Thông tin thanh toán"
            description={
              <div>
                Đơn hàng đã được đặt cọc và xe đã sẵn sàng. 
                Vui lòng hoàn tất thanh toán phần còn lại để tiến hành bàn giao xe.
              </div>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Mã đơn hàng">
              <strong>{order?.code}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá trị đơn hàng">
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                {formatPrice(paymentInfo.totalAmount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Đã đặt cọc">
              <span style={{ color: "#52c41a", fontWeight: 600 }}>
                - {formatPrice(paymentInfo.depositAmount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Phí bổ sung">
              <span style={{ color: "#fa8c16" }}>
                + {formatPrice(paymentInfo.additionalFees)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Còn phải thanh toán">
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1890ff" }}>
                {formatPrice(paymentInfo.finalPayment)}
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Form form={form} layout="vertical">
            <Form.Item
              name="method"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
              initialValue={0}
            >
              <Radio.Group>
                <Radio value={0}>💵 Tiền mặt</Radio>
                <Radio value={1}>🏦 Chuyển khoản</Radio>
                <Radio value={2}>💳 Thẻ tín dụng</Radio>
                <Radio value={3}>📱 Ví điện tử</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="transactionReference"
              label="Mã giao dịch / Số tham chiếu (tùy chọn)"
            >
              <Input
                placeholder="Nhập mã giao dịch nếu có"
                prefix={<CreditCardOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="note"
              label="Ghi chú thanh toán"
            >
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú về giao dịch (tùy chọn)"
              />
            </Form.Item>

            <div
              style={{
                padding: 12,
                backgroundColor: "#fff7e6",
                borderRadius: 8,
                border: "1px solid #ffd591",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 13, color: "#fa8c16", margin: 0 }}>
                ⚠️ <strong>Lưu ý:</strong> Sau khi xác nhận thanh toán, đơn hàng sẽ chuyển sang 
                trạng thái "Sẵn sàng bàn giao". Hệ thống sẽ tự động tạo hóa đơn và ghi nhận giao dịch.
              </p>
            </div>
          </Form>

          <div style={{ textAlign: "right" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", fontWeight: 600 }}
            >
              Xác nhận thanh toán {formatPrice(paymentInfo.finalPayment)}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RemainingPaymentModal;
