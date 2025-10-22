// src/features/dealer-staff/pages/CreateOrderPage.jsx
import React from "react";
import { Card, message } from "antd";
import { useAuth } from "../../../hooks/useAuth";
import OrderForm from "../components/OrderForm";

const CreateOrderPage = () => {
  const { user } = useAuth();

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
      <Card title="Tạo đơn hàng mới" bordered={false}>
        <OrderForm user={user} onFormResult={handleFormResult} />
      </Card>
    </div>
  );
};

export default CreateOrderPage;
