import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  Button,
  Empty,
  Space,
  Modal,
  Form,
  DatePicker,
  message,
  Collapse,
  Tag,
  InputNumber,
  Popconfirm,
  Switch,
  Divider,
  Input,
  Select,
  Spin,
} from "antd";
import { DeleteOutlined, ShoppingCartOutlined, CarOutlined, ClearOutlined } from "@ant-design/icons";
import moment from "moment";
import { vehicleService } from "../services/vehicleService";
import { customerService } from "../services/customerService";

const { Panel } = Collapse;

const OrderCart = ({ visible, onClose, cartItems, setCartItems, dealerId, userId }) => {
  const [form] = Form.useForm();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFinanced, setIsFinanced] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const groupedItems = () => {
    const grouped = {};
    cartItems.forEach((item) => {
      const key = item.variantId;
      if (!grouped[key]) {
        grouped[key] = {
          variantId: item.variantId,
          color: item.color,
          price: item.price,
          imageUrl: item.imageUrl,
          engine: item.engine,
          batteryType: item.batteryType,
          vehicles: [],
        };
      }
      grouped[key].vehicles.push({
        vehicleId: item.vehicleId,
        vin: item.vin,
      });
    });
    return Object.values(grouped);
  };

  const removeVehicle = (vehicleId) => {
    setCartItems((items) => items.filter((item) => item.vehicleId !== vehicleId));
  };

  const handleClearAll = () => {
    setCartItems([]);
    localStorage.removeItem("dealerCart");
    message.success("Đã xóa tất cả xe khỏi giỏ hàng");
  };

  const fetchCustomers = async () => {
    if (!dealerId) return;
    
    setLoadingCustomers(true);
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
      setLoadingCustomers(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.price || 0);
    }, 0);
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      message.warning("Giỏ hàng trống");
      return;
    }
    fetchCustomers(); // Fetch customers when opening modal
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async (values) => {
    setLoading(true);
    try {
      const orderCode = `ORD-${Date.now()}`;
      const cartTotal = calculateTotal();
      const otherCosts = values.otherCosts || 0;
      const totalAmount = cartTotal + otherCosts; // Tổng tiền đã bao gồm phí khác
      const discountAmount = values.discountAmount || 0;
      const finalAmount = totalAmount - discountAmount;

      const grouped = groupedItems();
      const orderDetails = [];
      
      grouped.forEach((group) => {
        group.vehicles.forEach((vehicle) => {
          orderDetails.push({
            vehicleVariantId: group.variantId,
            vehicleId: vehicle.vehicleId,
            quantity: 1,
            unitPrice: group.price || 0,
            discountPercent: 0,
            note: `VIN: ${vehicle.vin}`,
          });
        });
      });

      const orderData = {
        code: orderCode,
        customerId: values.customerId || null, // Add customer ID
        dealerId: dealerId,
        createdByUserId: userId,
        status: 0,
        totalAmount: totalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        expectedDeliveryAt: values.expectedDeliveryAt.toISOString(),
        orderType: 0,
        isFinanced: isFinanced,
        orderDetails: orderDetails,
      };

      // Add installment plan fields if isFinanced is true
      if (isFinanced) {
        orderData.installmentDuration = values.installmentDuration;
        orderData.monthlyPayment = values.monthlyPayment;
        orderData.interestRate = values.interestRate || 0;
        orderData.installmentProvider = values.installmentProvider || "Default Provider";
      }

      await vehicleService.createOrderWithDetails(orderData);
      message.success("Tạo đơn hàng thành công!");
      setCartItems([]);
      localStorage.removeItem("dealerCart");
      setShowOrderModal(false);
      onClose();
      form.resetFields();
      setIsFinanced(false);
    } catch (error) {
      console.error("Error creating order:", error);
      message.error(error.response?.data?.message || "Tạo đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showOrderModal) {
      const cartTotal = calculateTotal();
      form.setFieldsValue({
        cartTotal: cartTotal,
        otherCosts: 0,
        totalAmount: cartTotal,
        discountAmount: 0,
        finalAmount: cartTotal,
      });
    }
  }, [showOrderModal, form]);

  const handleCalculateTotals = () => {
    const cartTotal = form.getFieldValue("cartTotal") || 0;
    const other = form.getFieldValue("otherCosts") || 0;
    const totalAmount = cartTotal + other;
    const discount = form.getFieldValue("discountAmount") || 0;
    form.setFieldsValue({
      totalAmount: totalAmount,
      finalAmount: totalAmount - discount,
    });
  };

  return (
    <>
      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Space>
              <ShoppingCartOutlined />
              Giỏ hàng ({cartItems.length} xe)
            </Space>
            {cartItems.length > 0 && (
              <Popconfirm
                title="Xóa tất cả xe trong giỏ hàng?"
                description="Bạn có chắc chắn muốn xóa tất cả xe khỏi giỏ hàng không?"
                onConfirm={handleClearAll}
                okText="Xóa tất cả"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  type="text"
                  icon={<ClearOutlined />}
                  size="small"
                >
                  Xóa tất cả
                </Button>
              </Popconfirm>
            )}
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={450}
        footer={
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 16,
                textAlign: "right",
              }}
            >
              Tổng: {formatPrice(calculateTotal())}
            </div>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleCreateOrder}
              disabled={cartItems.length === 0}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                color: 'white',
                fontWeight: 600,
                height: 48
              }}
            >
              Tạo đơn hàng
            </Button>
          </div>
        }
      >
        {cartItems.length === 0 ? (
          <Empty description="Giỏ hàng trống" />
        ) : (
          <Collapse defaultActiveKey={[]} style={{ marginBottom: 16 }}>
            {groupedItems().map((group, index) => (
              <Panel
                key={index}
                header={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{group.color || "Không có màu"}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {group.engine && `${group.engine} • `}
                        {group.batteryType}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Tag color="blue">{group.vehicles.length} xe</Tag>
                      <div style={{ fontWeight: 600, color: "#1890ff", fontSize: 14 }}>
                        {formatPrice(group.price * group.vehicles.length)}
                      </div>
                    </div>
                  </div>
                }
              >
                <List
                  dataSource={group.vehicles}
                  renderItem={(vehicle) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeVehicle(vehicle.vehicleId)}
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CarOutlined style={{ fontSize: 24, color: "#1890ff" }} />}
                        title={<span style={{ fontSize: 13, fontWeight: 500 }}>VIN: {vehicle.vin}</span>}
                        description={
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {formatPrice(group.price)}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        )}
      </Drawer>

      <Modal
        title="Tạo đơn hàng"
        open={showOrderModal}
        onCancel={() => {
          setShowOrderModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitOrder}
        >
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
          >
            <Select
              showSearch
              placeholder="Chọn khách hàng cho đơn hàng"
              loading={loadingCustomers}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={loadingCustomers ? <Spin size="small" /> : "Không có dữ liệu"}
            >
              {customers.map((customer) => (
                <Select.Option key={customer.id} value={customer.id}>
                  {customer.fullName || customer.phone} - {customer.phone}
                  {customer.email && ` (${customer.email})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider style={{ margin: "16px 0" }} />

          <Form.Item
            name="cartTotal"
            label="Tổng tiền hàng"
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              disabled
            />
          </Form.Item>

          <Form.Item
            name="otherCosts"
            label="Chi phí khác"
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
              onChange={handleCalculateTotals}
            />
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label="Tổng cộng"
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              disabled
            />
          </Form.Item>

          <Form.Item
            name="discountAmount"
            label="Giảm giá"
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
              onChange={handleCalculateTotals}
            />
          </Form.Item>

          <Form.Item
            name="finalAmount"
            label="Thành tiền"
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              disabled
            />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Trả góp"
            style={{ marginBottom: 16 }}
          >
            <Switch
              checked={isFinanced}
              onChange={(checked) => setIsFinanced(checked)}
              checkedChildren="Có"
              unCheckedChildren="Không"
            />
          </Form.Item>

          {isFinanced && (
            <>
              <Form.Item
                name="installmentDuration"
                label="Thời hạn trả góp (tháng)"
                rules={[{ required: isFinanced, message: "Vui lòng nhập thời hạn trả góp" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  max={120}
                  placeholder="Ví dụ: 12, 24, 36..."
                />
              </Form.Item>

              <Form.Item
                name="monthlyPayment"
                label="Số tiền trả mỗi tháng"
                rules={[{ required: isFinanced, message: "Vui lòng nhập số tiền trả mỗi tháng" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                  placeholder="Số tiền trả hàng tháng"
                />
              </Form.Item>

              <Form.Item
                name="interestRate"
                label="Lãi suất (%)"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="Ví dụ: 5.5"
                />
              </Form.Item>

              <Form.Item
                name="installmentProvider"
                label="Nhà cung cấp trả góp"
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: Ngân hàng ABC"
                />
              </Form.Item>
            </>
          )}

          <Divider />

          <Form.Item
            name="expectedDeliveryAt"
            label="Ngày giao dự kiến"
            rules={[{ required: true, message: "Vui lòng chọn ngày giao" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                return current && current < moment().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button 
                size="large"
                onClick={() => setShowOrderModal(false)}
                style={{
                  height: 40
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                size="large"
                htmlType="submit" 
                loading={loading}
                style={{
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  color: 'white',
                  fontWeight: 600,
                  height: 40
                }}
              >
                Xác nhận tạo đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default OrderCart;
