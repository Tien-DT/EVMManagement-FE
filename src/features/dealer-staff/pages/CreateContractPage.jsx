// src/features/dealer-staff/pages/CreateContractPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { contractService } from "../services/contractService";
import { orderService } from "../services/orderService";
import FileUpload from "../../../components/FileUpload";
import moment from "moment";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateContractPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [contractLink, setContractLink] = useState("");
  const [dealerWarningShown, setDealerWarningShown] = useState(false);
  const storedUserProfile = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("userProfile");
      if (raw) {
        const profile = JSON.parse(raw);
        return profile;
      }
    } catch (error) {
      console.error("Error parsing userProfile from sessionStorage:", error);
    }
    return null;
  }, []);

  const dealerId = user?.dealerId || storedUserProfile?.dealerId;
  const createdByUserId = user?.userProfileId || storedUserProfile?.id;
  const statusOptions = [
    { value: "DRAFT", label: "Bản nháp" },
    { value: "PENDING_SIGNATURE", label: "Chờ ký" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "CANCELED", label: "Đã hủy" },
  ];

  useEffect(() => {
    if (!dealerId) {
      return;
    }
    fetchOrders(dealerId);
  }, [dealerId]);

  useEffect(() => {
    if (createdByUserId) {
      form.setFieldsValue({ createdByUserId });
    }
  }, [createdByUserId, form]);

  useEffect(() => {
    if (
      !dealerWarningShown &&
      user &&
      Object.prototype.hasOwnProperty.call(user, "dealerId") &&
      !dealerId
    ) {
      message.error(
        "Không tìm thấy thông tin đại lý. Vui lòng đăng nhập lại."
      );
      setDealerWarningShown(true);
    }
  }, [user, dealerId, dealerWarningShown]);

  const fetchOrders = async (currentDealerId) => {
    try {
      setLoading(true);
      const response = await orderService.getOrdersByDealer(
        currentDealerId,
        1,
        100,
        { orderType: 0 }
      );

      if (!response || response.success === false) {
        message.error(response?.message || "Không thể tải danh sách đơn hàng");
        setOrders([]);
        return;
      }

      if (response.data) {
        let ordersData = [];

        if (Array.isArray(response.data.items)) {
          ordersData = response.data.items;
        } else if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          ordersData = response.data;
        }

        setOrders(ordersData);
      } else {
        message.error("Không thể tải danh sách đơn hàng");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    setSelectedOrder(order);

    if (order) {
      form.setFieldsValue({
        customerId: order.customer?.id || order.customerId,
        customerName:
          order.customer?.fullName ||
          order.customer?.name ||
          order.customerId,
      });
    } else {
      form.setFieldsValue({
        customerId: undefined,
        customerName: undefined,
      });
    }
  };

  // FIX: Đổi tên function cho khớp với prop của FileUpload
  const handleFileUploadComplete = (url) => {
    setContractLink(url);
    form.setFieldsValue({ contractLink: url });
    message.success("Tải lên tài liệu hợp đồng thành công");
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      if (!createdByUserId) {
        message.error("Không tìm thấy thông tin người tạo hợp đồng");
        setSubmitting(false);
        return;
      }

      // Kiểm tra xem đã upload file chưa
      if (!contractLink) {
        message.error("Vui lòng tải lên tài liệu hợp đồng");
        setSubmitting(false);
        return;
      }

      if (!values.customerId) {
        message.error("Không tìm thấy thông tin khách hàng của đơn hàng đã chọn");
        setSubmitting(false);
        return;
      }

      // Chuyển đổi định dạng ngày
      const formattedValues = {
        code: values.code,
        orderId: values.orderId,
        customerId: values.customerId,
        createdByUserId: createdByUserId,
        terms: values.terms,
        status: values.status,
        contractLink: contractLink,
        signedAt: values.signedAt ? values.signedAt.toISOString() : null,
      };

      console.log("Submitting contract data:", formattedValues);

      const response = await contractService.createContract(formattedValues);

      if (response && (response.success || response.data)) {
        message.success("Tạo hợp đồng mới thành công");
        navigate("/dealer-staff/contracts");
      } else {
        message.error("Không thể tạo hợp đồng mới");
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tạo hợp đồng mới"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px" }}>Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="create-contract-page">
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <FileTextOutlined
              style={{ marginRight: "8px", fontSize: "20px" }}
            />
            <span className="text-xl font-bold">Tạo hợp đồng mới</span>
          </div>
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dealer-staff/contracts")}
          >
            Quay lại
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: "DRAFT",
            createdByUserId: createdByUserId,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã hợp đồng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã hợp đồng",
                  },
                ]}
              >
                <Input placeholder="Nhập mã hợp đồng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderId"
                label="Đơn hàng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đơn hàng",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn đơn hàng"
                  onChange={handleOrderChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      ?.includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {orders.map((order) => (
                    <Option key={order.id} value={order.id}>
                      {`${order.code || order.id} - ${
                        order.customer?.fullName ||
                        order.customer?.name ||
                        "Khách hàng không xác định"
                      } - ${Number(
                        order.finalAmount ?? order.totalAmount ?? 0
                      ).toLocaleString()} VNĐ`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Khách hàng">
                <Input
                  value={
                    selectedOrder?.customer?.fullName ||
                    selectedOrder?.customer?.name ||
                    form.getFieldValue("customerName") ||
                    ""
                  }
                  placeholder="Chọn đơn hàng để hiển thị khách hàng"
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Người tạo">
                <Input
                  value={user?.fullName || user?.name || createdByUserId || ""}
                  readOnly
                  placeholder="Thông tin người tạo"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="customerId"
            hidden
            rules={[
              {
                required: true,
                message: "Vui lòng chọn khách hàng",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="customerName" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="createdByUserId"
            hidden
            rules={[
              {
                required: true,
                message: "Không tìm thấy thông tin người tạo",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái",
                  },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statusOptions.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="signedAt" label="Ngày ký">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày ký"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="terms"
            label="Điều khoản"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập điều khoản hợp đồng",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập điều khoản hợp đồng" />
          </Form.Item>

          {selectedOrder && (
            <Card
              type="inner"
              title="Thông tin đơn hàng"
              style={{ marginBottom: 24 }}
              size="small"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Mã đơn hàng:</Text>
                  <div>{selectedOrder.code || selectedOrder.id}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái:</Text>
                  <div>{selectedOrder.status || "N/A"}</div>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col span={12}>
                  <Text strong>Thành tiền:</Text>
                  <div>
                    {Number(
                      selectedOrder.finalAmount ??
                        selectedOrder.totalAmount ??
                        0
                    ).toLocaleString()} VNĐ
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Loại đơn:</Text>
                  <div>{selectedOrder.orderType || "N/A"}</div>
                </Col>
              </Row>
              {selectedOrder.customer && (
                <Row gutter={16} style={{ marginTop: 12 }}>
                  <Col span={12}>
                    <Text strong>Khách hàng:</Text>
                    <div>
                      {selectedOrder.customer.fullName ||
                        selectedOrder.customer.name ||
                        selectedOrder.customerId}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong>SĐT:</Text>
                    <div>
                      {selectedOrder.customer.phone ||
                        selectedOrder.customer.phoneNumber ||
                        "N/A"}
                    </div>
                  </Col>
                </Row>
              )}
              {selectedOrder.expectedDeliveryAt && (
                <Row gutter={16} style={{ marginTop: 12 }}>
                  <Col span={12}>
                    <Text strong>Giao dự kiến:</Text>
                    <div>
                      {moment(selectedOrder.expectedDeliveryAt).format(
                        "DD/MM/YYYY"
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </Card>
          )}

          <Divider orientation="left">Tài liệu hợp đồng</Divider>

          <Form.Item
            label="Tài liệu hợp đồng"
            extra="Tải lên tài liệu hợp đồng (PDF, JPG, PNG)"
            required
          >
            <FileUpload onUploadComplete={handleFileUploadComplete} />
            {contractLink && (
              <div className="mt-2">
                <Text type="success">✓ File đã được tải lên thành công</Text>
                <br />
                <a
                  href={contractLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem file
                </a>
              </div>
            )}
          </Form.Item>

          {/* Hidden field để validate */}
          <Form.Item
            name="contractLink"
            hidden
            rules={[
              {
                required: true,
                message: "Vui lòng tải lên tài liệu hợp đồng",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
              disabled={!contractLink}
              style={{ marginTop: "16px" }}
            >
              Tạo hợp đồng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateContractPage;
