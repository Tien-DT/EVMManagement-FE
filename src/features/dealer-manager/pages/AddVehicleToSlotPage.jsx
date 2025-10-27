import { useState } from "react";
import { Card, message, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AddVehicleToSlotForm } from "../components/AddVehicleToSlotForm";
import { useTestDriveVehicles } from "../hooks/useTestDriveVehicles";

export const AddVehicleToSlotPage = () => {
  const { addVehicle, isAdding } = useTestDriveVehicles();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await addVehicle(formData);
      messageApi.success("Thêm xe vào slot lái thử thành công");
      setTimeout(() => {
        navigate("/dealer/test-drive-vehicles");
      }, 1500);
    } catch (error) {
      messageApi.error("Thêm xe vào slot lái thử thất bại");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {contextHolder}
      <div className="mb-4">
        <Link to="/dealer/test-drive-vehicles">
          <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
        </Link>
      </div>
      <Card title="Thêm xe vào slot lái thử" className="max-w-2xl mx-auto">
        <AddVehicleToSlotForm onSubmit={handleSubmit} isSubmitting={isAdding} />
      </Card>
    </div>
  );
};
