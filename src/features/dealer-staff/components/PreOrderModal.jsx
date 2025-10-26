import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Input, InputNumber, Button, Steps, message, Spin, Radio } from "antd";
import { UserOutlined, DollarOutlined, FileTextOutlined } from "@ant-design/icons";
import { customerService } from "../services/customerService";

const { Step } = Steps;
const { TextArea } = Input;

const PreOrderModal = ({ visible, onClose, variant, dealerId, onSuccess }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Fetch customers when modal opens
  useEffect(() => {
    if (visible && dealerId) {
      fetchCustomers();
    }
  }, [visible, dealerId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setCurrentStep(0);
      setSelectedCustomer(null);
      setOrderData(null);
    }
  }, [visible, form]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomersByDealer(dealerId, 1, 1000);
      if (response.success && response.data) {
        const customersList = Array.isArray(response.data) 
          ? response.data 
          : response.data.items || [];
        setCustomers(customersList);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep === 0) {
        // Step 1: Validate customer selection
        const customerId = form.getFieldValue('customerId');
        if (!customerId) {
          message.error("Vui lòng chọn khách hàng");
          return;
        }
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // Step 2: Review order info before deposit
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Validate ALL fields including hidden ones from previous steps
      const values = await form.validateFields([
        'customerId',
        'depositMethod',
        'note',
        'depositNote'
      ]);
      
      setSubmitting(true);

      // Check required fields explicitly
      if (!values.customerId) {
        message.error("Vui lòng quay lại bước 1 và chọn khách hàng");
        setSubmitting(false);
        return;
      }

      if (!variant?.id) {
        message.error("Không tìm thấy thông tin xe");
        setSubmitting(false);
        return;
      }
      
      // Call parent component's success handler with form data
      await onSuccess({
        customerId: values.customerId,
        variantId: variant.id,
        note: values.note || "",
        depositMethod: values.depositMethod || 0,
        depositNote: values.depositNote || "",
      });

      // If we reach here without error, it means success
      // Reset form and close modal
      form.resetFields();
      setCurrentStep(0);
      setSelectedCustomer(null);
      onClose();
      
    } catch (error) {
      // Check if it's a validation error
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      } else {
        const errorMsg = error.response?.data?.message 
          || error.message 
          || "Có lỗi xảy ra khi đặt trước";
        message.error(errorMsg, 5);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const depositAmount = variant?.price ? variant.price * 0.1 : 0;
  const remainingAmount = variant?.price ? variant.price * 0.9 : 0;

  const steps = [
    {
      title: "Chọn khách hàng",
      icon: <UserOutlined />,
    },
    {
      title: "Thông tin đơn hàng",
      icon: <FileTextOutlined />,
    },
    {
      title: "Đặt cọc",
      icon: <DollarOutlined />,
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title={
        <div style={{ fontSize: 20, fontWeight: 600 }}>
          Đặt trước xe - {variant?.color || "N/A"}
        </div>
      }
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <Form form={form} layout="vertical">
        {/* Step 1: Select Customer */}
        {currentStep === 0 && (
          <div>
            <Form.Item
              name="customerId"
              label="Chọn khách hàng"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
            >
              <Select
                showSearch
                placeholder="Tìm kiếm và chọn khách hàng"
                loading={loading}
                onChange={handleCustomerSelect}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                size="large"
              >
                {customers.map((customer) => (
                  <Select.Option key={customer.id} value={customer.id}>
                    {customer.fullName || customer.phone} - {customer.phone}
                    {customer.email && ` (${customer.email})`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedCustomer && (
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                  marginTop: 16,
                }}
              >
                <h4 style={{ marginBottom: 8 }}>Thông tin khách hàng:</h4>
                <p><strong>Họ tên:</strong> {selectedCustomer.fullName || "N/A"}</p>
                <p><strong>Số điện thoại:</strong> {selectedCustomer.phone}</p>
                <p><strong>Email:</strong> {selectedCustomer.email || "N/A"}</p>
                <p><strong>Địa chỉ:</strong> {selectedCustomer.address || "N/A"}</p>
                {selectedCustomer.cardId && (
                  <p><strong>CCCD/CMND:</strong> {selectedCustomer.cardId}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Order Information */}
        {currentStep === 1 && (
          <div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#e6f7ff",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <h4 style={{ marginBottom: 16, color: "#1890ff" }}>Thông tin xe đặt trước:</h4>
              
              {variant?.imageUrl && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <img
                    src={variant.imageUrl}
                    alt={variant.color}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <p><strong>Màu sắc:</strong> {variant?.color || "N/A"}</p>
                <p><strong>Động cơ:</strong> {variant?.engine || "N/A"}</p>
                <p><strong>Loại pin:</strong> {variant?.batteryType || "N/A"}</p>
                <p><strong>Tốc độ tối đa:</strong> {variant?.maximumSpeed ? `${variant.maximumSpeed} km/h` : "N/A"}</p>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#fff",
                  borderRadius: 4,
                  border: "1px solid #91d5ff",
                }}
              >
                <p style={{ fontSize: 18, fontWeight: 700, color: "#1890ff", marginBottom: 8 }}>
                  <strong>Giá xe:</strong> {formatPrice(variant?.price)}
                </p>
                <p style={{ fontSize: 16, color: "#52c41a" }}>
                  <strong>Tiền đặt cọc (10%):</strong> {formatPrice(depositAmount)}
                </p>
                <p style={{ fontSize: 16, color: "#fa8c16" }}>
                  <strong>Còn lại:</strong> {formatPrice(remainingAmount)}
                </p>
              </div>
            </div>

            <Form.Item
              name="note"
              label="Ghi chú đơn hàng"
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
              />
            </Form.Item>
          </div>
        )}

        {/* Step 3: Deposit Information */}
        {currentStep === 2 && (
          <div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#f6ffed",
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid #b7eb8f",
              }}
            >
              <h4 style={{ marginBottom: 12, color: "#52c41a" }}>💰 Thông tin đặt cọc</h4>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#52c41a" }}>
                Số tiền cần đặt cọc: {formatPrice(depositAmount)}
              </p>
              <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                Sau khi đặt cọc thành công, đơn hàng sẽ được chuyển sang trạng thái "Đang xử lý".
                Khi có xe sẵn sàng, bạn sẽ thanh toán phần còn lại: {formatPrice(remainingAmount)}
              </p>
            </div>

            <Form.Item
              name="depositMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
              initialValue={0}
            >
              <Radio.Group>
                <Radio value={0}>Tiền mặt</Radio>
                <Radio value={1}>Chuyển khoản</Radio>
                <Radio value={2}>Thẻ tín dụng</Radio>
                <Radio value={3}>Ví điện tử</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="depositNote"
              label="Ghi chú đặt cọc"
            >
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú cho khoản đặt cọc (tùy chọn)"
              />
            </Form.Item>

            <div
              style={{
                padding: 12,
                backgroundColor: "#fff7e6",
                borderRadius: 8,
                border: "1px solid #ffd591",
              }}
            >
              <p style={{ fontSize: 13, color: "#fa8c16", margin: 0 }}>
                ⚠️ <strong>Lưu ý:</strong> Sau khi xác nhận, hệ thống sẽ tự động tạo đơn hàng và ghi nhận khoản đặt cọc.
                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
              </p>
            </div>
          </div>
        )}
      </Form>

      {/* Footer Buttons */}
      <div style={{ marginTop: 24, textAlign: "right" }}>
        {currentStep > 0 && (
          <Button onClick={handleBack} style={{ marginRight: 8 }}>
            Quay lại
          </Button>
        )}
        {currentStep < 2 && (
          <Button type="primary" onClick={handleNext}>
            Tiếp tục
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Xác nhận đặt trước
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default PreOrderModal;
