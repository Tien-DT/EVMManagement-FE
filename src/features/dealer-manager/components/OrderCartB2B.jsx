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
  Popconfirm,
  Divider,
  Input,
} from "antd";
import { DeleteOutlined, ShoppingCartOutlined, ClearOutlined } from "@ant-design/icons";
import moment from "moment";
import { vehicleService } from "../../dealer-staff/services/vehicleService";

const { Panel } = Collapse;
const { TextArea } = Input;

const OrderCartB2B = ({ visible, onClose, cartItems, setCartItems, dealerId, userId }) => {
  const [form] = Form.useForm();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
          vehicleModelName: item.vehicleModelName || "Unknown Model", // ← Add this!
          vehicles: [],
        };
      }
      if (item.vehicleId) {
        grouped[key].vehicles.push({
          vehicleId: item.vehicleId,
          vin: item.vin,
          quantity: item.quantity || 1,
        });
      } else {
        grouped[key].vehicles.push({
          vehicleId: null,
          vin: null,
          quantity: item.quantity || 1,
          isVariantOnly: true, 
        });
      }
    });
    return Object.values(grouped);
  };

  const removeVehicle = (vehicleId, variantId) => {
    setCartItems((items) => {
      if (vehicleId) {
        return items.filter((item) => item.vehicleId !== vehicleId);
      }
      const index = items.findIndex(item => item.variantId === variantId && !item.vehicleId);
      if (index > -1) {
        return [...items.slice(0, index), ...items.slice(index + 1)];
      }
      return items;
    });
  };

  const handleClearAll = () => {
    setCartItems([]);
    localStorage.removeItem("dealerManagerB2BCart");
    message.success("Đã xóa tất cả xe khỏi giỏ hàng B2B");
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + (item.price || 0) * quantity;
    }, 0);
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      message.warning("Giỏ hàng trống");
      return;
    }
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async (values) => {
    setLoading(true);
    try {
      const orderCode = `B2B-${Date.now()}`;
      const cartTotal = calculateTotal();
      const otherCosts = values.otherCosts || 0;
      const totalAmount = cartTotal + otherCosts;
      const discountAmount = values.discountAmount || 0;
      const finalAmount = totalAmount - discountAmount;

      const grouped = groupedItems();
      const orderDetails = [];
      
      grouped.forEach((group) => {
        group.vehicles.forEach((vehicle) => {
          orderDetails.push({
            vehicleVariantId: group.variantId,
            vehicleId: vehicle.vehicleId, // null for variant-only items
            quantity: vehicle.quantity || 1,
            unitPrice: group.price || 0,
            discountPercent: 0,
            note: vehicle.isVariantOnly ? "Variant order" : `VIN: ${vehicle.vin}`,
          });
        });
      });

      const orderData = {
        code: orderCode,
        customerId: null, 
        dealerId: dealerId,
        createdByUserId: userId,
        status: 1, 
        totalAmount: totalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        expectedDeliveryAt: values.expectedDeliveryAt ? values.expectedDeliveryAt.toISOString() : null,
        orderType: 1,
        isFinanced: false,
        orderDetails: orderDetails,
      };

      console.log("Creating B2B order:", orderData);

      await vehicleService.createOrderWithDetails(orderData);
      message.success("Đặt xe từ hãng thành công! Đơn hàng đang chờ báo giá từ EVM.");
      setCartItems([]);
      localStorage.removeItem("dealerManagerB2BCart");
      setShowOrderModal(false);
      onClose();
      form.resetFields();
    } catch (error) {
      console.error("Error creating B2B order:", error);
      message.error(error.response?.data?.message || "Tạo đơn hàng B2B thất bại");
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
              Giỏ hàng B2B ({cartItems.length} xe)
            </Space>
            {cartItems.length > 0 && (
              <Popconfirm
                title="Xóa tất cả xe trong giỏ hàng B2B?"
                description="Bạn có chắc chắn muốn xóa tất cả xe khỏi giỏ hàng không?"
                onConfirm={handleClearAll}
                okText="Xóa tất cả"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger type="text" icon={<ClearOutlined />} size="small">
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
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "right" }}>
              Tổng: {formatPrice(calculateTotal())}
            </div>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleCreateOrder}
              disabled={cartItems.length === 0}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                color: 'white',
                fontWeight: 600,
                height: 48
              }}
            >
              Đặt xe từ hãng (B2B)
            </Button>
          </div>
        }
      >
        {cartItems.length === 0 ? (
          <Empty description="Giỏ hàng B2B trống" />
        ) : (
          <Collapse defaultActiveKey={[]} style={{ marginBottom: 16 }}>
            {groupedItems().map((group, index) => (
              <Panel
                key={index}
                header={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {group.vehicleModelName || "Unknown Model"}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {group.color} • {group.engine && `${group.engine} • `}
                        {group.batteryType}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Tag color="blue">
                        {group.vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0)} xe
                      </Tag>
                      <div style={{ fontWeight: 600, color: "#1890ff", fontSize: 14 }}>
                        {formatPrice(group.price * group.vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0))}
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
                          onClick={() => removeVehicle(vehicle.vehicleId, group.variantId)}
                          size="small"
                        >
                          Xóa
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          vehicle.isVariantOnly ? (
                            <span style={{ fontSize: 13 }}>
                              <Tag color="orange">Variant Order</Tag>
                              Số lượng: {vehicle.quantity || 1}
                            </span>
                          ) : (
                            <span style={{ fontSize: 13 }}>VIN: {vehicle.vin}</span>
                          )
                        }
                        description={
                          <span style={{ fontSize: 12, color: "#999" }}>
                            {formatPrice(group.price * (vehicle.quantity || 1))}
                          </span>
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
        title="Xác nhận đặt xe từ hãng (B2B)"
        open={showOrderModal}
        onCancel={() => {
          setShowOrderModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitOrder}
        >
          <Divider>Thông tin đơn hàng</Divider>
          
          <Form.Item label="Tổng giá trị giỏ hàng" name="cartTotal">
            <Input
              readOnly
              size="large"
              style={{ fontWeight: 600, fontSize: 16, color: "#1890ff" }}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item label="Chi phí khác (vận chuyển, thuế...)" name="otherCosts">
            <Input
              type="number"
              size="large"
              onChange={handleCalculateTotals}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item label="Tổng tiền" name="totalAmount">
            <Input
              readOnly
              size="large"
              style={{ fontWeight: 600, fontSize: 16 }}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item label="Giảm giá (nếu có)" name="discountAmount">
            <Input
              type="number"
              size="large"
              onChange={handleCalculateTotals}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item label="Thành tiền" name="finalAmount">
            <Input
              readOnly
              size="large"
              style={{ fontWeight: 700, fontSize: 18, color: "#52c41a" }}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item
            label="Ngày giao dự kiến"
            name="expectedDeliveryAt"
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < moment().startOf("day")}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} placeholder="Ghi chú cho đơn hàng B2B (tùy chọn)" />
          </Form.Item>

          <Divider />

          <div style={{ marginBottom: 16, padding: 12, backgroundColor: "#e6f7ff", borderRadius: 6 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#1890ff" }}>
              ℹ️ <strong>Lưu ý:</strong> Đơn hàng B2B sẽ được gửi đến EVM để báo giá. 
              Giá cuối cùng có thể thay đổi dựa trên số lượng và chính sách của hãng.
            </p>
          </div>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => {
              setShowOrderModal(false);
              form.resetFields();
            }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Xác nhận đặt xe
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default OrderCartB2B;
