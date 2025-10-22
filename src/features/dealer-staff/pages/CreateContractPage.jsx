// src/features/dealer-staff/pages/CreateContractPage.jsx
import React, { useState, useEffect } from "react";
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

const { Title, Text } = Typography;
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      if (response && (response.success || response.data)) {
        setOrders(response.data.items || []);
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

  // FIX: Đổi tên function cho khớp với prop của FileUpload
  const handleFileUploadComplete = (url) => {
    setContractLink(url);
    form.setFieldsValue({ contractLink: url });
    message.success("Tải lên tài liệu hợp đồng thành công");
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Kiểm tra xem đã upload file chưa
      if (!contractLink) {
        message.error("Vui lòng tải lên tài liệu hợp đồng");
        setSubmitting(false);
        return;
      }

      // Chuyển đổi định dạng ngày
      const formattedValues = {
        ...values,
        contractLink: contractLink, // Đảm bảo contractLink được gửi
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
                >
                  {orders.map((order) => (
                    <Option key={order.id} value={order.id}>
                      {order.code || order.id}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn khách hàng",
                  },
                ]}
              >
                <Input disabled placeholder="Khách hàng từ đơn hàng đã chọn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="createdByUserId"
                label="Người tạo"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn người tạo",
                  },
                ]}
              >
                <Input disabled placeholder="Người tạo từ đơn hàng đã chọn" />
              </Form.Item>
            </Col>
          </Row>

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
                  <Option value="DRAFT">Bản nháp</Option>
                  <Option value="PENDING_SIGNATURE">Chờ ký</Option>
                  <Option value="ACTIVE">Đang hoạt động</Option>
                  <Option value="CANCELED">Đã hủy</Option>
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
