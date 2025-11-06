// src/features/dealer-staff/pages/CreateContractPage.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Space,
  Alert
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  DownloadOutlined
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { contractService } from "../services/contractService";
import { orderService } from "../services/orderService";
import moment from "moment";
import buildContractPdf from "../../../utils/pdf/contractPdfBuilder";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateContractPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dealerWarningShown, setDealerWarningShown] = useState(false);
  
  // Lấy orderId từ URL query params
  const orderIdFromUrl = searchParams.get("orderId");
  const storedUserProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) {
        const profile = JSON.parse(raw);
        return profile;
      }
    } catch (error) {
      console.error("Error parsing userProfile from localStorage:", error);
    }
    return null;
  }, []);

  const dealerId = user?.dealerId || storedUserProfile?.dealerId;
  const createdByUserId = user?.userProfileId || storedUserProfile?.id;
  const staffName =
    user?.fullName ||
    storedUserProfile?.fullName ||
    user?.name ||
    storedUserProfile?.name ||
    "";
  const staffPhone = user?.phone || storedUserProfile?.phone || "";
  const statusOptions = [
    { value: "PENDING_SIGNATURE", label: "Chờ ký" },
    { value: "DRAFT", label: "Bản nháp" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "CANCELED", label: "Đã hủy" },
  ];
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "0 ₫";
    }

    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(value));
    } catch (error) {
      console.warn("Currency format fallback", error);
      return `${Number(value).toLocaleString("vi-VN")} ₫`;
    }
  };

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

  // Auto-select order nếu có orderId từ URL
  useEffect(() => {
    if (orderIdFromUrl && orders.length > 0) {
      const order = orders.find((o) => o.id === orderIdFromUrl);
      if (order) {
        form.setFieldsValue({ orderId: orderIdFromUrl });
        handleOrderChange(orderIdFromUrl);
        message.success(`Đã tự động chọn đơn hàng: ${order.code}`);
      }
    }
  }, [orderIdFromUrl, orders, form]);

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

  const handleDownloadDraft = async () => {
    try {
      const values = await form.validateFields([
        "code",
        "orderId",
        "status",
        "terms",
      ]);

      const currentOrder =
        selectedOrder || orders.find((order) => order.id === values.orderId);

      if (!currentOrder) {
        message.warning("Vui lòng chọn đơn hàng để tạo hợp đồng PDF.");
        return;
      }

      const customerInfo = currentOrder.customer || {};
      const orderItems = Array.isArray(currentOrder.orderDetails)
        ? currentOrder.orderDetails
        : Array.isArray(currentOrder.items)
        ? currentOrder.items
        : [];
      const statusLabel =
        statusOptions.find((option) => option.value === values.status)?.label ||
        values.status ||
        "N/A";

      const sections = [
        {
          title: "Thông tin hợp đồng",
          type: "keyValue",
          rows: [
            { label: "Mã hợp đồng", value: values.code || "Chưa có" },
            { label: "Ngày tạo", value: moment().format("DD/MM/YYYY") },
            { label: "Trạng thái dự kiến", value: statusLabel },
          ],
        },
        {
          title: "Thông tin khách hàng",
          type: "keyValue",
          rows: [
            {
              label: "Khách hàng",
              value:
                customerInfo.fullName ||
                customerInfo.name ||
                currentOrder.customerId ||
                "N/A",
            },
            { label: "Email", value: customerInfo.email || "N/A" },
            {
              label: "Số điện thoại",
              value:
                customerInfo.phone || customerInfo.phoneNumber || "N/A",
            },
            { label: "Địa chỉ", value: customerInfo.address || "N/A" },
          ],
        },
        {
          title: "Thông tin đơn hàng",
          type: "keyValue",
          rows: [
            {
              label: "Mã đơn hàng",
              value: currentOrder.code || currentOrder.id || "N/A",
            },
            { label: "Loại đơn", value: currentOrder.orderType || "N/A" },
            {
              label: "Thành tiền",
              value: formatCurrency(
                currentOrder.finalAmount ?? currentOrder.totalAmount ?? 0
              ),
            },
            {
              label: "Ngày giao dự kiến",
              value: currentOrder.expectedDeliveryAt
                ? moment(currentOrder.expectedDeliveryAt).format("DD/MM/YYYY")
                : "N/A",
            },
          ],
        },
        orderItems.length
          ? {
              title: "Chi tiết sản phẩm",
              type: "cards",
              cards: orderItems.map((item, index) => ({
                title: `Sản phẩm ${index + 1}`,
                rows: [
                  {
                    label: "Tên sản phẩm",
                    value:
                      item.vehicleVariant?.vehicleModel?.name ||
                      item.vehicleVariant?.name ||
                      item.vehicleModelName ||
                      item.name ||
                      "N/A",
                  },
                  {
                    label: "Biến thể",
                    value:
                      item.vehicleVariant?.color ||
                      item.vehicleVariantId ||
                      item.color ||
                      "N/A",
                  },
                  {
                    label: "Số lượng",
                    value: item.quantity ?? item.qty ?? "N/A",
                  },
                  {
                    label: "Đơn giá",
                    value: formatCurrency(
                      item.unitPrice ?? item.price ?? item.listedPrice ?? 0
                    ),
                  },
                  item.note
                    ? { label: "Ghi chú", value: item.note }
                    : null,
                ].filter(Boolean),
              })),
            }
          : null,
        {
          title: "Điều khoản",
          type: "text",
          text: values.terms || "",
        },
      ].filter(Boolean);

      const doc = buildContractPdf({
        title: `Hợp đồng mua bán ${values.code || ""}`,
        sections,
        signature: {
          leftLabel: "Bên bán",
          rightLabel: "Bên mua",
          extraNotes: [`Ngày tạo bản nháp: ${moment().format("DD/MM/YYYY")}`],
          preparedBy: staffName
            ? `${staffName}${staffPhone ? ` (${staffPhone})` : ""}`
            : undefined,
        },
      });

      doc.save(`HopDong_${values.code || "draft"}.pdf`);
      message.success("Đã tạo file hợp đồng PDF.");
    } catch (error) {
      if (error?.errorFields) {
        message.error(
          "Vui lòng hoàn thành thông tin hợp đồng trước khi tải PDF."
        );
      } else {
        console.error("Error generating contract PDF", error);
        message.error("Không thể tạo file hợp đồng. Vui lòng thử lại.");
      }
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

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      if (!createdByUserId) {
        message.error("Không tìm thấy thông tin người tạo hợp đồng");
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
        contractLink: null,
        signedAt: values.signedAt ? values.signedAt.toISOString() : null,
      };

      console.log("Submitting contract data:", formattedValues);

      const response = await contractService.createContract(formattedValues);

      if (response && (response.success || response.data)) {
        // Cập nhật status order thành CREATED_CONTRACT
        try {
          await orderService.updateOrder(values.orderId, {
            ...selectedOrder,
            status: "CREATED_CONTRACT"
          });
          console.log("✅ Order status updated to CREATED_CONTRACT");
        } catch (updateError) {
          console.error("❌ Error updating order status:", updateError);
          // Không block flow nếu update order lỗi
        }

        message.success(
          "Tạo hợp đồng mới thành công. Vui lòng tải hợp đồng PDF, ký và tải lên sau."
        );
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
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dealer-staff/contracts")}
            >
              Quay lại
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadDraft}
            >
              Tải hợp đồng PDF
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: "PENDING_SIGNATURE", // Mặc định là Chờ ký
            createdByUserId: createdByUserId,
            orderId: orderIdFromUrl || undefined, // Auto-fill nếu có từ URL
          }}
        >
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Quy trình ký hợp đồng"
            description="Điền thông tin hợp đồng và nhấn 'Tải hợp đồng PDF' để tải bản nháp. Sau khi ký và đóng dấu, hãy truy cập trang chi tiết hợp đồng để tải file đã ký lên."
          />

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

          <Row gutter={16} style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #f0f0f0" }}>
            <Col span={24}>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                  style={{
                    height: "40px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  Tạo hợp đồng
                </Button>
                <Button
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadDraft}
                  style={{
                    height: "40px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "16px",
                  }}
                >
                  Tải bản nháp PDF
                </Button>
                <Button
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/dealer-staff/contracts")}
                  style={{
                    height: "40px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "16px",
                  }}
                >
                  Quay lại
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateContractPage;

