import { useState, useEffect } from "react";
import { Form, Select, DatePicker, Button, message } from "antd";
import { useTestDriveSlots } from "../../dealer-manager/hooks/useTestDriveSlots";
import { useDealerVehicles } from "../../dealer-staff/hooks/useDealerVehicles";
import { useAuth } from "../../../context/AuthContext";
import dayjs from "dayjs";

export const AddVehicleToSlotForm = ({ onSubmit, isSubmitting }) => {
  const [form] = Form.useForm();
  const { slots, isLoading: isSlotsLoading } = useTestDriveSlots();
  const { vehicles, isLoading: isVehiclesLoading } = useDealerVehicles();
  const { user } = useAuth();
  const dealerId = user?.dealerId;

  const handleFinish = (values) => {
    const formattedValues = {
      ...values,
      dealerId,
      slotDate: values.slotDate.toISOString(),
      status: "AVAILABLE",
    };
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        status: "AVAILABLE",
      }}
    >
      <Form.Item
        name="vehicleId"
        label="Chọn xe"
        rules={[{ required: true, message: "Vui lòng chọn xe" }]}
      >
        <Select
          placeholder="Chọn xe từ kho"
          loading={isVehiclesLoading}
          disabled={isVehiclesLoading}
        >
          {vehicles?.map((vehicle) => (
            <Select.Option key={vehicle.id} value={vehicle.id}>
              {vehicle.name} - {vehicle.modelName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="masterSlotId"
        label="Chọn slot lái thử"
        rules={[{ required: true, message: "Vui lòng chọn slot lái thử" }]}
      >
        <Select
          placeholder="Chọn slot lái thử"
          loading={isSlotsLoading}
          disabled={isSlotsLoading}
        >
          {slots?.map((slot) => (
            <Select.Option key={slot.id} value={slot.id}>
              {slot.name} - {slot.description}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="slotDate"
        label="Chọn ngày"
        rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          disabledDate={(current) =>
            current && current < dayjs().startOf("day")
          }
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isSubmitting} block>
          Thêm xe vào slot
        </Button>
      </Form.Item>
    </Form>
  );
};
