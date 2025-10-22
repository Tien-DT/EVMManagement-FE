// src/features/dealer-staff/components/OrderForm.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  Spin,
  Divider,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import moment from "moment";

const { Option } = Select;

const OrderForm = ({ user, onFormResult }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Lấy danh sách báo giá khi component mount
  useEffect(() => {
    const fetchQuotations = async () => {
      if (user && user.id) {
        setLoading(true);
        try {
          const response = await orderService.getQuotations(user.id);
          console.log("Quotations API response:", response);

          if (!response) {
            console.error("API response is undefined or null");
            setQuotations([]);
            setLoading(false);
            return;
          }

          let quotationsData = [];

          if (Array.isArray(response)) {
            quotationsData = response;
          } else if (response.data) {
            if (Array.isArray(response.data)) {
              quotationsData = response.data;
            } else if (typeof response.data === "object") {
              if (Array.isArray(response.data.items)) {
                quotationsData = response.data.items;
              } else if (Array.isArray(response.data.data)) {
                quotationsData = response.data.data;
              } else if (
                response.data.quotations &&
                Array.isArray(response.data.quotations)
              ) {
                quotationsData = response.data.quotations;
              }
            }
          }

          console.log("Final quotations data:", quotationsData);
          setQuotations(quotationsData);

          if (quotationsData.length === 0) {
            console.warn("No quotations found");
          }
        } catch (error) {
          console.error("Error fetching quotations:", error);
          message.error("Không thể tải danh sách báo giá");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuotations();
  }, [user]);

  // Xử lý khi chọn báo giá
  const handleQuotationChange = (quotationId) => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (quotation) {
      setSelectedQuotation(quotation);

      let calculatedTotal = 0;
      if (
        quotation.quotationDetails &&
        Array.isArray(quotation.quotationDetails)
      ) {
        calculatedTotal = quotation.quotationDetails.reduce((sum, detail) => {
          const itemTotal =
            (detail.unitPrice *
              detail.quantity *
              (100 - (detail.discountPercent || 0))) /
            100;
          return sum + itemTotal;
        }, 0);
      }

      setTotalAmount(calculatedTotal);
      setDiscountAmount(0);
      setFinalAmount(calculatedTotal);

      form.setFieldsValue({
        quotationId: quotation.id,
        customerId: quotation.customerId,
        totalAmount: calculatedTotal,
        discountAmount: 0,
        finalAmount: calculatedTotal,
      });
    }
  };

  // Xử lý khi thay đổi giá trị discountAmount
  const handleDiscountChange = (value) => {
    const discount = value || 0;
    setDiscountAmount(discount);
    const final = totalAmount - discount;
    setFinalAmount(final);
    form.setFieldsValue({ finalAmount: final });
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Lấy thông tin từ sessionStorage
      const userStr = sessionStorage.getItem("user");
      const userProfileStr = sessionStorage.getItem("userProfile");

      let accountId = null;
      let userProfileId = null;
      let dealerId = null;

      // Lấy accountId từ user
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          accountId = userData.id;
          console.log("✅ Lấy accountId từ user:", accountId);
        } catch (err) {
          console.error("❌ Lỗi khi parse user:", err);
        }
      }

      // Lấy userProfileId và dealerId từ userProfile
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          userProfileId = userProfile.id;
          dealerId = userProfile.dealerId;
          console.log("✅ Lấy userProfileId từ userProfile:", userProfileId);
          console.log("✅ Lấy dealerId từ userProfile:", dealerId);
        } catch (err) {
          console.error("❌ Lỗi khi parse userProfile:", err);
        }
      }

      // Nếu không có userProfileId, sử dụng accountId
      if (!userProfileId && accountId) {
        userProfileId = accountId;
        console.log("⚠️ Sử dụng accountId làm userProfileId:", userProfileId);
      }

      // Nếu không có dealerId, sử dụng dealerId từ form
      if (!dealerId && values.dealerId) {
        dealerId = values.dealerId;
        console.log("⚠️ Sử dụng dealerId từ form:", dealerId);
      }

      // Validate thông tin cần thiết
      if (!userProfileId) {
        const errorMsg =
          "Không tìm thấy thông tin UserProfile. Vui lòng đăng nhập lại.";
        console.error(errorMsg);
        message.error(errorMsg);
        if (onFormResult) {
          onFormResult({ success: false, message: errorMsg });
        }
        return;
      }

      if (!dealerId) {
        const errorMsg =
          "Không tìm thấy thông tin Dealer. Vui lòng đăng nhập lại.";
        console.error(errorMsg);
        message.error(errorMsg);
        if (onFormResult) {
          onFormResult({ success: false, message: errorMsg });
        }
        return;
      }

      // Chuẩn bị dữ liệu order
      const orderData = {
        code: values.code,
        quotationId: values.quotationId,
        customerId: values.customerId,
        dealerId: dealerId,
        createdByUserId: userProfileId,
        status: values.status,
        totalAmount: values.totalAmount,
        discountAmount: values.discountAmount,
        finalAmount: values.finalAmount,
        expectedDeliveryAt: values.expectedDeliveryAt.toISOString(),
        orderType: values.orderType,
        isFinanced: values.isFinanced || false,
      };

      console.log("📤 Creating order with data:", orderData);

      const response = await orderService.createOrder(orderData);

      console.log("📥 Create order response:", response);

      // Xử lý response
      if (response && (response.success || response.data)) {
        message.success("Tạo đơn hàng thành công");
        if (onFormResult) {
          onFormResult({ success: true, message: "Tạo đơn hàng thành công" });
        }
        // Chờ 500ms để user thấy message success
        setTimeout(() => {
          navigate("/dealer-staff/orders");
        }, 500);
      } else {
        const errorMsg = response?.message || "Tạo đơn hàng thất bại";
        message.error(errorMsg);
        if (onFormResult) {
          onFormResult({ success: false, message: errorMsg });
        }
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tạo đơn hàng";
      message.error(errorMsg);
      if (onFormResult) {
        onFormResult({ success: false, message: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && quotations.length === 0) {
    return (
      <div
        className="loading-container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "CONFIRMED",
        orderType: "B2C",
        isFinanced: false,
        discountAmount: 0,
      }}
    >
      <Form.Item
        name="code"
        label="Mã đơn hàng"
        rules={[{ required: true, message: "Vui lòng nhập mã đơn hàng" }]}
      >
        <Input placeholder="Nhập mã đơn hàng" />
      </Form.Item>

      <Form.Item
        name="quotationId"
        label="Báo giá"
        rules={[{ required: true, message: "Vui lòng chọn báo giá" }]}
      >
        <Select
          placeholder="Chọn báo giá"
          onChange={handleQuotationChange}
          loading={loading}
          notFoundContent={loading ? <Spin size="small" /> : "Không có báo giá"}
        >
          {quotations.map((quotation) => (
            <Option key={quotation.id} value={quotation.id}>
              {quotation.code} -{" "}
              {quotation.customerName || "Không có tên khách hàng"}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="customerId" label="Khách hàng" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="dealerId" label="Đại lý" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="createdByUserId" label="Người tạo" hidden>
        <Input />
      </Form.Item>

      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
      >
        <Select placeholder="Chọn trạng thái">
          <Option value="CONFIRMED">Đã xác nhận</Option>
          <Option value="AWAITING_DEPOSIT">Chờ đặt cọc</Option>
          <Option value="IN_PROGRESS">Đang xử lý</Option>
          <Option value="READY_FOR_HANDOVER">Sẵn sàng bàn giao</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="CANCELED">Đã hủy</Option>
        </Select>
      </Form.Item>

      <Divider>Thông tin thanh toán</Divider>

      <Form.Item
        name="totalAmount"
        label="Tổng tiền"
        rules={[{ required: true, message: "Vui lòng nhập tổng tiền" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          disabled
        />
      </Form.Item>

      <Form.Item
        name="discountAmount"
        label="Giảm giá"
        rules={[{ required: true, message: "Vui lòng nhập số tiền giảm giá" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          onChange={handleDiscountChange}
          min={0}
        />
      </Form.Item>

      <Form.Item
        name="finalAmount"
        label="Thành tiền"
        rules={[{ required: true, message: "Vui lòng nhập thành tiền" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          disabled
        />
      </Form.Item>

      <Form.Item
        name="expectedDeliveryAt"
        label="Ngày giao dự kiến"
        rules={[{ required: true, message: "Vui lòng chọn ngày giao dự kiến" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày giao dự kiến"
        />
      </Form.Item>

      <Form.Item
        name="orderType"
        label="Loại đơn hàng"
        rules={[{ required: true, message: "Vui lòng chọn loại đơn hàng" }]}
      >
        <Select placeholder="Chọn loại đơn hàng" disabled>
          <Option value="B2C">B2C</Option>
        </Select>
      </Form.Item>

      <Form.Item name="isFinanced" valuePropName="checked" label="Tài chính">
        <Checkbox>Đơn hàng có tài chính</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            padding: "0 16px",
            height: "40px",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          className="ant-btn-primary"
        >
          Tạo đơn hàng
        </Button>
        <Button
          style={{
            marginLeft: 8,
            height: "40px",
            padding: "0 16px",
            fontWeight: "500",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
          }}
          onClick={() => navigate("/dealer-staff/orders")}
        >
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderForm;
