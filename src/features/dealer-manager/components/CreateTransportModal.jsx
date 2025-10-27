import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, message, Table, Tag } from "antd";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import dayjs from "dayjs";

const { Option } = Select;

const CreateTransportModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEligibleOrders();
    } else {
      form.resetFields();
      setSelectedOrderIds([]);
    }
  }, [visible]);

  const fetchEligibleOrders = async () => {
    setLoadingOrders(true);
    try {
      // Get current user's dealer ID from localStorage
      const userProfile = JSON.parse(localStorage.getItem("userProfile"));
      const dealerId = userProfile?.dealerId;

      if (!dealerId) {
        message.error("Không tìm thấy thông tin dealer");
        return;
      }

      // Fetch orders for this dealer
      const response = await axiosInstance.get(endpoints.orders.getByDealer(dealerId));

      if (response.data) {
        // Filter for B2B orders with IN_PROGRESS status
        const eligibleOrders = response.data.filter(
          (order) => order.orderType === 1 && order.status === "IN_PROGRESS"
        );
        setOrders(eligibleOrders);
      }
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        providerName: values.providerName,
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation,
        scheduledPickupAt: values.scheduledPickupAt
          ? values.scheduledPickupAt.toISOString()
          : null,
        orderIds: selectedOrderIds,
      };

      await axiosInstance.post(endpoints.transports.create, payload);
      message.success("Tạo vận chuyển thành công!");
      onSuccess();
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin");
      } else {
        message.error("Không thể tạo vận chuyển");
      }
      console.error("Error creating transport:", error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Loại",
      dataIndex: "orderType",
      key: "orderType",
      render: () => <Tag color="blue">B2B</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="processing">Đang xử lý</Tag>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `${amount?.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedOrderIds,
    onChange: (selectedRowKeys) => {
      setSelectedOrderIds(selectedRowKeys);
    },
  };

  return (
    <Modal
      title="Tạo vận chuyển mới"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={900}
      okText="Tạo vận chuyển"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="providerName"
          label="Nhà cung cấp vận chuyển"
          rules={[{ required: false }]}
        >
          <Input placeholder="Nhập tên nhà cung cấp (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="pickupLocation"
          label="Điểm lấy hàng"
          rules={[{ required: false }]}
        >
          <Input placeholder="Nhập địa chỉ lấy hàng (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="dropoffLocation"
          label="Điểm giao hàng"
          rules={[{ required: false }]}
        >
          <Input placeholder="Nhập địa chỉ giao hàng (tùy chọn)" />
        </Form.Item>

        <Form.Item
          name="scheduledPickupAt"
          label="Thời gian lấy hàng dự kiến"
          rules={[{ required: false }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            placeholder="Chọn thời gian lấy hàng"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Chọn đơn hàng <span style={{ color: "red" }}>*</span>
            </span>
          }
          required
        >
          <div style={{ marginBottom: 8, color: "#666" }}>
            Chỉ hiển thị đơn hàng B2B đang ở trạng thái "Đang xử lý"
          </div>
          <Table
            rowSelection={rowSelection}
            columns={orderColumns}
            dataSource={orders}
            rowKey="id"
            loading={loadingOrders}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 300 }}
            locale={{
              emptyText: "Không có đơn hàng phù hợp",
            }}
          />
          {selectedOrderIds.length === 0 && (
            <div style={{ color: "red", marginTop: 8 }}>
              Vui lòng chọn ít nhất một đơn hàng
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTransportModal;

