import React from "react";
import { Form, Input, DatePicker, Switch, Select } from "antd";
import dayjs from "dayjs";

const rankingOptions = [
  { label: "Standard", value: 0 },
  { label: "Premium", value: 1 },
  { label: "Luxury", value: 2 },
];

const VehicleModelForm = ({ form, initialValues }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        code: "",
        name: "",
        launchDate: initialValues?.launchDate ? dayjs(initialValues.launchDate) : undefined,
        description: "",
        status: true,
        ranking: 0,
        ...initialValues,
      }}
    >
      <Form.Item name="code" label="Code" rules={[{ required: true, message: "Code is required" }]}>
        <Input placeholder="e.g., TESLA-M3" />
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
        <Input placeholder="e.g., Model 3" />
      </Form.Item>
      <Form.Item name="launchDate" label="Launch Date">
        <DatePicker className="w-full" />
      </Form.Item>
      <Form.Item name="ranking" label="Ranking" initialValue="Standard">
        <Select options={rankingOptions} />
      </Form.Item>
      <Form.Item name="status" label="Status" valuePropName="checked" initialValue>
        <Switch />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
};

export default VehicleModelForm;


