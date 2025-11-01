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
import { customerService } from "../services/customerService";
import { useCart } from "../../../context/CartContext";
import moment from "moment";

const { Option } = Select;

const OrderForm = ({ user, onFormResult, fromCart, cartItems }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [dealerId, setDealerId] = useState(null);

  // Fetch dealerId and customers
  useEffect(() => {
    const fetchDealerAndCustomers = async () => {
      try {
        // Get dealerId from localStorage
        const cachedDealerId = localStorage.getItem("dealerId");
        if (cachedDealerId) {
          setDealerId(cachedDealerId);
          
          // Fetch customers by dealer
          const customerResponse = await customerService.getCustomersByDealer(
            cachedDealerId,
            1,
            100
          );
          
          if (customerResponse.success && customerResponse.data) {
            const customersList = customerResponse.data.items || customerResponse.data;
            setCustomers(customersList);
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchDealerAndCustomers();
  }, []);

  // No longer need to calculate amounts from cart

  // No longer need to fetch quotations

  // No longer need quotation change handler

  // No longer need discount change handler

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!values.code || !values.customerId || !values.status || 
          !values.expectedDeliveryAt || !values.orderType) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        setLoading(false);
        return;
      }

      // No longer need to validate amounts

      // Lấy thông tin từ localStorage
      const userStr = localStorage.getItem("user");
      const userProfileStr = localStorage.getItem("userProfile");
      const cachedDealerId = localStorage.getItem("dealerId");

      let accountId = null;
      let userProfileId = null;
      let dealerIdToUse = cachedDealerId;

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

      // Lấy userProfileId từ userProfile
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          userProfileId = userProfile.id;
          console.log("✅ Lấy userProfileId từ userProfile:", userProfileId);
        } catch (err) {
          console.error("❌ Lỗi khi parse userProfile:", err);
        }
      }

      // Nếu không có userProfileId, sử dụng accountId
      if (!userProfileId && accountId) {
        userProfileId = accountId;
        console.log("⚠️ Sử dụng accountId làm userProfileId:", userProfileId);
      }

      // Validate GUID format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!values.customerId || !guidRegex.test(values.customerId)) {
        message.error("Customer ID không hợp lệ. Vui lòng chọn lại khách hàng.");
        setLoading(false);
        return;
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

      if (!guidRegex.test(userProfileId)) {
        const errorMsg = "User Profile ID không hợp lệ. Vui lòng đăng nhập lại.";
        console.error(errorMsg);
        message.error(errorMsg);
        setLoading(false);
        return;
      }

      if (!dealerIdToUse) {
        const errorMsg =
          "Không tìm thấy thông tin Dealer. Vui lòng đăng nhập lại.";
        console.error(errorMsg);
        message.error(errorMsg);
        if (onFormResult) {
          onFormResult({ success: false, message: errorMsg });
        }
        return;
      }

      if (!guidRegex.test(dealerIdToUse)) {
        const errorMsg = "Dealer ID không hợp lệ. Vui lòng đăng nhập lại.";
        console.error(errorMsg);
        message.error(errorMsg);
        setLoading(false);
        return;
      }
      
      console.log("✅ All IDs validated as proper GUIDs");
      console.log("- customerId:", values.customerId);
      console.log("- dealerId:", dealerIdToUse);
      console.log("- userProfileId:", userProfileId);

      // Format expectedDeliveryAt properly
      let expectedDeliveryDate;
      try {
        if (moment.isMoment(values.expectedDeliveryAt)) {
          expectedDeliveryDate = values.expectedDeliveryAt.toISOString();
        } else if (values.expectedDeliveryAt instanceof Date) {
          expectedDeliveryDate = values.expectedDeliveryAt.toISOString();
        } else {
          expectedDeliveryDate = new Date(values.expectedDeliveryAt).toISOString();
        }
      } catch (dateError) {
        console.error("Error formatting date:", dateError);
        message.error("Ngày giao dự kiến không hợp lệ");
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu order (without amounts and quotation)
      const orderData = {
        code: values.code.trim(),
        customerId: values.customerId,
        dealerId: dealerIdToUse,
        createdByUserId: userProfileId,
        status: values.status,
        expectedDeliveryAt: expectedDeliveryDate,
        orderType: values.orderType,
        isFinanced: Boolean(values.isFinanced),
      };

      console.log("📤 Creating order with data:", JSON.stringify(orderData, null, 2));
      console.log("📤 Request will be sent to:", process.env.REACT_APP_API_BASE_URL + "/v1/Orders");

      // If coming from cart, create order with details
      if (fromCart && cartItems && cartItems.length > 0) {
        console.log("🛒 Creating order from cart with items:", cartItems);
        
        // Validate cart items
        if (!cartItems[0].variant?.id || !cartItems[0].vehicle?.id) {
          message.error("Thông tin xe trong giỏ hàng không đầy đủ");
          setLoading(false);
          return;
        }
        
        // Prepare order details from cart (only first item for now as per requirement)
        const firstItem = cartItems[0];
        const orderDetails = [{
          vehicleVariantId: firstItem.variant.id,
          vehicleId: firstItem.vehicle.id,
          quantity: Number(firstItem.quantity) || 1,
          unitPrice: Number(firstItem.variant.price) || 0,
          discountPercent: Number(firstItem.discountPercent) || 0,
          note: String(firstItem.note || ""),
        }];

        console.log("📤 Order details to create:", JSON.stringify(orderDetails, null, 2));

        const response = await orderService.createOrderWithDetails(
          orderData,
          orderDetails
        );

        console.log("📥 Create order with details response:", response);

        if (response && response.success) {
          message.success("Tạo đơn hàng thành công");
          clearCart(); // Clear cart after successful order
          
          if (onFormResult) {
            onFormResult({ success: true, message: "Tạo đơn hàng thành công" });
          }
          
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
      } else {
        // Normal order creation without cart
        const response = await orderService.createOrder(orderData);

        console.log("📥 Create order response:", response);

        if (response && (response.success || response.data)) {
          message.success("Tạo đơn hàng thành công");
          if (onFormResult) {
            onFormResult({ success: true, message: "Tạo đơn hàng thành công" });
          }
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
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      
      // Extract detailed error message
      let errorMsg = "Lỗi khi tạo đơn hàng";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMsg = errorData.errors.join(", ");
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      console.error("Final error message:", errorMsg);
      message.error(errorMsg, 5); // Show for 5 seconds
      
      if (onFormResult) {
        onFormResult({ success: false, message: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  // No longer need loading spinner check for quotations

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "AWAITING_CONFIRM",
        orderType: "B2C",
        isFinanced: false,
      }}
    >
      <Form.Item
        name="code"
        label="Mã đơn hàng"
        rules={[{ required: true, message: "Vui lòng nhập mã đơn hàng" }]}
      >
        <Input placeholder="Nhập mã đơn hàng" />
      </Form.Item>

      {/* Removed quotation selection field */}

      <Form.Item 
        name="customerId" 
        label="Khách hàng"
        rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
      >
        <Select
          placeholder="Chọn khách hàng"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {customers.map((customer) => (
            <Option key={customer.id} value={customer.id}>
              {customer.fullName} - {customer.phoneNumber}
            </Option>
          ))}
        </Select>
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
        <Select placeholder="Chọn trạng thái" disabled>
          <Option value="AWAITING_CONFIRM">Chờ xác nhận</Option>
        </Select>
      </Form.Item>

      {/* Removed amount fields: totalAmount, discountAmount, finalAmount */}

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
