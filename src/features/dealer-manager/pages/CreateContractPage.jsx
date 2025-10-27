// src/features/dealer-manager/pages/CreateContractPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { contractService } from "../../dealer-staff/services/contractService";
import { orderService } from "../../dealer-staff/services/orderService";
import FileUpload from "../../../components/FileUpload";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateContractPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [contractLink, setContractLink] = useState("");
  const prefilledOrderId = searchParams.get("orderId");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Auto-select order if orderId is provided in query params
    if (prefilledOrderId && orders.length > 0) {
      const order = orders.find((o) => o.id === prefilledOrderId);
      if (order) {
        form.setFieldsValue({
          orderId: order.id,
        });
        handleOrderChange(order.id);
      }
    }
  }, [prefilledOrderId, orders, form]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      if (response && (response.success || response.data)) {
        // Filter only B2C orders (orderType = 0)
        const allOrders = response.data.items || [];
        const b2cOrders = allOrders.filter(order => order.orderType === 0);
        setOrders(b2cOrders);
      } else {
        message.error("Không thể tải danh sách đơn hàng");
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
        customerId: order.customerId,
        createdByUserId: order.createdByUserId,
      });
    } else {
      form.setFieldsValue({
        customerId: undefined,
        createdByUserId: undefined,
      });
    }
  };

  const handleFileUploadComplete = (url) => {
    setContractLink(url);
    form.setFieldsValue({ contractLink: url });
    message.success("Tải lên tài liệu hợp đồng thành công");
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      if (!contractLink) {
        message.error("Vui lòng tải lên tài liệu hợp đồng");
        setSubmitting(false);
        return;
      }

      const formattedValues = {
        ...values,
        contractLink: contractLink,
        signedAt: values.signedAt ? values.signedAt.toISOString() : null,
      };

      console.log("Submitting contract data:", formattedValues);

      const response = await contractService.createContract(formattedValues);

      if (response && (response.success || response.data)) {
        message.success("Tạo hợp đồng mới thành công");
        navigate("/dealer/contracts");
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
            <span style={{ fontSize: "20px", fontWeight: 600 }}>Tạo hợp đồng mới</span>
          </div>
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dealer/orders")}
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
                <Input placeholder="VD: CONTRACT-2025-001" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderId"
                label={
                  <span>
                    Đơn hàng <Tag color="green">B2C</Tag>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đơn hàng B2C",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn đơn hàng B2C"
                  onChange={handleOrderChange}
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  disabled={loading}
                >
                  {orders.map((order) => (
                    <Option key={order.id} value={order.id}>
                      {order.code || order.id} - {order.customer?.fullName || "N/A"}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedOrder && (
            <div style={{ 
              backgroundColor: "#f0f9ff", 
              padding: "16px", 
              borderRadius: "8px", 
              marginBottom: "16px",
              border: "1px solid #bae7ff"
            }}>
              <Title level={5} style={{ marginBottom: "12px", color: "#1890ff" }}>
                Thông tin đơn hàng đã chọn:
              </Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Mã đơn: </Text>
                  <Text>{selectedOrder.code}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Khách hàng: </Text>
                  <Text>{selectedOrder.customer?.fullName || "N/A"}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Tổng tiền: </Text>
                  <Text style={{ color: "#52c41a", fontWeight: 600 }}>
                    {selectedOrder.finalAmount?.toLocaleString()} VND
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái: </Text>
                  <Tag color="blue">{selectedOrder.status}</Tag>
                </Col>
              </Row>
            </div>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="ID Khách hàng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đơn hàng để lấy thông tin khách hàng",
                  },
                ]}
              >
                <Input disabled placeholder="Tự động điền từ đơn hàng" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="createdByUserId"
                label="ID Người tạo"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đơn hàng để lấy thông tin người tạo",
                  },
                ]}
              >
                <Input disabled placeholder="Tự động điền từ đơn hàng" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái hợp đồng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái",
                  },
                ]}
              >
                <Select placeholder="Chọn trạng thái" size="large">
                  <Option value="DRAFT">
                    <Tag color="default">Nháp</Tag>
                  </Option>
                  <Option value="PENDING">
                    <Tag color="orange">Chờ xử lý</Tag>
                  </Option>
                  <Option value="ACTIVE">
                    <Tag color="green">Đang hiệu lực</Tag>
                  </Option>
                  <Option value="COMPLETED">
                    <Tag color="blue">Hoàn thành</Tag>
                  </Option>
                  <Option value="TERMINATED">
                    <Tag color="red">Đã hủy</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="signedAt"
                label="Ngày ký hợp đồng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày ký",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày ký hợp đồng"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Tài liệu hợp đồng</Divider>

          <Form.Item
            label="Tải lên file hợp đồng (PDF)"
            name="contractLink"
            rules={[
              {
                required: true,
                message: "Vui lòng tải lên tài liệu hợp đồng",
              },
            ]}
          >
            <FileUpload
              onUploadComplete={handleFileUploadComplete}
              acceptedFileTypes=".pdf,.doc,.docx"
              maxFileSize={10}
            />
            {contractLink && (
              <div style={{ marginTop: "8px" }}>
                <Text type="success">✅ Đã tải lên: </Text>
                <a href={contractLink} target="_blank" rel="noopener noreferrer">
                  Xem tài liệu
                </a>
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú cho hợp đồng (tùy chọn)"
            />
          </Form.Item>

          <Divider />

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button
                onClick={() => navigate("/dealer/orders")}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
                size="large"
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
              >
                Tạo hợp đồng
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateContractPage;
