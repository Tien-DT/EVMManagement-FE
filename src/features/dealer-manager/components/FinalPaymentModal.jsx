import React, { useState } from "react";
import { Modal, Button, Spin, message, Descriptions, Alert } from "antd";
import { DollarCircleOutlined } from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const FinalPaymentModal = ({ visible, order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  // Final payment amount is 90% of total amount (remaining after 10% deposit)
  const finalPaymentAmount = order.totalAmount ? order.totalAmount * 0.9 : 0;

  // Deposit amount that was already paid (10%)
  const depositAmount = order.totalAmount ? order.totalAmount * 0.1 : 0;

  // SEPay minimum amount is 10,000 VND (same as VNPay)
  const SEPAY_MIN_AMOUNT = 10000;

  const handleFinalPayment = async () => {
    // Validate minimum amount
    if (finalPaymentAmount < SEPAY_MIN_AMOUNT) {
      message.error(
        `Số tiền thanh toán tối thiểu là ${SEPAY_MIN_AMOUNT.toLocaleString(
          "vi-VN"
        )} ₫. Số tiền hiện tại: ${finalPaymentAmount.toLocaleString("vi-VN")} ₫`
      );
      return;
    }

    console.log("Order data:", order);
    console.log("Final payment amount:", finalPaymentAmount);

    setLoading(true);
    try {
      // Call SEPay API to create payment URL
      const response = await axiosInstance.post(
        endpoints.payments.sepayCreate,
        {
          orderId: order.id,
          amount: finalPaymentAmount,
          orderInfo: `Thanh toán 90% còn lại cho đơn hàng ${order.code}`,
          isDeposit: false, // This is final payment, not deposit
          locale: "vn",
        }
      );

      console.log("SEPay create payment response:", response.data);

      // Get transaction code and payment URL from response
      const responseData = response.data?.data || response.data;
      const transactionCode = responseData?.transactionCode;
      const paymentUrl = responseData?.paymentUrl;

      if (transactionCode && paymentUrl) {
        message.success("Đang chuyển đến trang thanh toán SEPay...", 1);

        // Redirect to polling page with transaction code AND payment URL
        setTimeout(() => {
          console.log(
            "Redirecting to polling page with transaction:",
            transactionCode
          );
          const encodedPaymentUrl = encodeURIComponent(paymentUrl);
          window.location.href = `/payment/sepay-polling?transaction_code=${transactionCode}&payment_url=${encodedPaymentUrl}`;
        }, 500);
      } else {
        setLoading(false);
        console.error("No payment URL found in response:", response.data);
        throw new Error("Không tìm thấy link thanh toán trong response");
      }
    } catch (error) {
      console.error("Error creating final payment:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tạo thanh toán"
      );
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DollarCircleOutlined
            style={{ color: "#52c41a", fontSize: "20px" }}
          />
          <span>Thanh toán phần còn lại</span>
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
          onClick={handleFinalPayment}
          icon={<DollarCircleOutlined />}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Thanh toán qua SEPay
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loading}>
        <Alert
          message="Thông tin thanh toán"
          description="Bạn cần thanh toán 90% còn lại của giá trị đơn hàng trước khi nhận xe. Thanh toán sẽ được thực hiện qua cổng thanh toán SEPay."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Mã đơn hàng">
            <strong>{order.code}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              {order.totalAmount?.toLocaleString("vi-VN")} ₫
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Đã đặt cọc (10%)">
            <span style={{ fontSize: "16px", color: "#999" }}>
              {depositAmount.toLocaleString("vi-VN")} ₫
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền cần thanh toán (90%)">
            <span
              style={{ fontSize: "18px", fontWeight: 700, color: "#52c41a" }}
            >
              {finalPaymentAmount.toLocaleString("vi-VN")} ₫
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Alert
          message="Lưu ý"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Sau khi thanh toán thành công, bạn có thể nhận xe</li>
              <li>Vui lòng kiểm tra kỹ thông tin trước khi thanh toán</li>
              <li>Bạn sẽ được chuyển đến trang thanh toán SEPay</li>
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

export default FinalPaymentModal;
