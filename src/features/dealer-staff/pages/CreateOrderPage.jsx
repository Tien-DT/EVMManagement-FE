// src/features/dealer-staff/pages/CreateOrderPage.jsx
import React from "react";
import { Card, message } from "antd";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import OrderForm from "../components/OrderForm";

const CreateOrderPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { fromCart, cartItems } = location.state || {};

  // Xử lý kết quả từ form
  const handleFormResult = (result) => {
    if (result.success) {
      message.success(result.message || "Tạo đơn hàng thành công");
    } else {
      message.error(result.message || "Tạo đơn hàng thất bại");
    }
  };

  return (
    <div className="create-order-page">
      <Card 
        title={fromCart ? "Tạo đơn hàng từ giỏ hàng" : "Tạo đơn hàng mới"} 
        bordered={false}
      >
        <OrderForm 
          user={user} 
          onFormResult={handleFormResult}
          fromCart={fromCart}
          cartItems={cartItems}
        />
      </Card>
    </div>
  );
};

export default CreateOrderPage;
