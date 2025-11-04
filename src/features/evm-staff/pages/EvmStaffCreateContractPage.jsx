// src/features/evm-staff/pages/EvmStaffCreateContractPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Form, Input, Select, Button, Typography, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useAuth } from "../../../hooks/useAuth";

const { Title, Text } = Typography;
const { TextArea } = Input;

const EvmStaffCreateContractPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  const preselectedOrderId = searchParams.get("orderId") || undefined;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      // Basic list; backend can filter in future if needed
      const res = await axiosInstance.get(endpoints.orders.getAll);
      const items = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      // Sort newest first if createdDate available
      items.sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));
      setOrders(items);
      if (preselectedOrderId && items.find((o) => String(o.id) === String(preselectedOrderId))) {
        form.setFieldsValue({ orderId: preselectedOrderId });
      }
    } catch (e) {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Resolve createdByUserId (UserProfile ID)
      let createdByUserId = user?.userProfileId;
      if (!createdByUserId) {
        try {
          const profile = await axiosInstance.get(endpoints.userProfile.getByAccount(user?.id));
          createdByUserId = profile?.data?.id || profile?.id;
          if (createdByUserId) {
            localStorage.setItem("userProfile", JSON.stringify(profile.data || profile));
          }
        } catch (e) {
          // ignore, will fail validation below
        }
      }

      if (!createdByUserId) {
        message.error("Không tìm thấy UserProfile của bạn");
        setSubmitting(false);
        return;
      }

      const selectedOrder = orders.find((o) => String(o.id) === String(values.orderId));
      if (!selectedOrder) {
        message.error("Vui lòng chọn đơn hàng hợp lệ");
        setSubmitting(false);
        return;
      }

      const payload = {
        code: values.code || `CONTRACT-${Date.now().toString().slice(-6)}`,
        orderId: selectedOrder.id,
        customerId: null,
        dealerId: selectedOrder.dealerId,
        createdByUserId,
        signedByUserId: null,
        contractType: "B2B",
        terms: values.terms,
        status: "PENDING_SIGNATURE",
        signedAt: null,
        contractLink: null,
      };

      const res = await axiosInstance.post(endpoints.contracts.create, payload);

      if (res?.success || res?.data) {
        // Link order to contract and update status if possible
        try {
          const createdContract = res.data || res;
          const orderUpdate = {
            code: selectedOrder.code,
            dealerId: selectedOrder.dealerId,
            status: "CREATED_CONTRACT",
            orderType: selectedOrder.orderType,
            contractId: createdContract.id,
          };
          if (selectedOrder.customerId) orderUpdate.customerId = selectedOrder.customerId;
          if (selectedOrder.quotationId) orderUpdate.quotationId = selectedOrder.quotationId;
          if (selectedOrder.finalAmount) orderUpdate.finalAmount = selectedOrder.finalAmount;
          if (selectedOrder.totalAmount) orderUpdate.totalAmount = selectedOrder.totalAmount;
          await axiosInstance.put(endpoints.orders.update(selectedOrder.id), orderUpdate);
        } catch (_) {
          // non-blocking
        }

        message.success("Tạo hợp đồng thành công");
        navigate("/evm-staff/contracts");
        return;
      }

      throw new Error("Không thể tạo hợp đồng");
    } catch (e) {
      if (e?.errorFields) return; // antd form errors
      message.error(e.message || "Lỗi khi tạo hợp đồng");
    } finally {
      setSubmitting(false);
    }
  };

  const pageStyles = `
    .create-contract-page { padding: 24px; background: #f5f7fa; min-height: 100vh; }
    .hero { margin-bottom: 16px; }
  `;

  return (
    <div className="create-contract-page">
      <Card className="hero" bordered={false} style={{ borderRadius: 12 }}>
        <Title level={3} style={{ marginBottom: 4 }}>Tạo hợp đồng</Title>
        <Text type="secondary">Chọn đơn hàng và nhập thông tin hợp đồng.</Text>
      </Card>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical" initialValues={{ orderId: preselectedOrderId }}>
          <Form.Item
            label="Đơn hàng"
            name="orderId"
            rules={[{ required: true, message: "Vui lòng chọn đơn hàng" }]}
          >
            <Select
              loading={loadingOrders}
              placeholder="Chọn đơn hàng"
              showSearch
              optionFilterProp="label"
              options={orders.map((o) => ({
                value: o.id,
                label: `${o.code || o.id} - ${o.orderType || ""}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Tên/Mã hợp đồng"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập tên/mã hợp đồng" }]}
          >
            <Input placeholder="VD: HĐ đại lý tháng 11" />
          </Form.Item>

          <Form.Item
            label="Điều khoản hợp đồng"
            name="terms"
            rules={[{ required: true, message: "Vui lòng nhập điều khoản" }]}
          >
            <TextArea rows={8} placeholder="Nhập các điều khoản và điều kiện..." />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="primary" icon={<PlusOutlined />} loading={submitting} onClick={handleSubmit}>
              Tạo hợp đồng
            </Button>
          </div>
        </Form>
      </Card>

      <style jsx>{pageStyles}</style>
    </div>
  );
};

export default EvmStaffCreateContractPage;


