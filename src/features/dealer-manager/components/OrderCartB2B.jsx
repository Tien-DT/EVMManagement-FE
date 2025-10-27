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
      
      const grouped = groupedItems();
      const orderDetails = [];
      const orderNote = values.note || ""; // Get note from form
      
      grouped.forEach((group) => {
        group.vehicles.forEach((vehicle) => {
          // Combine auto-generated note with user's note
          let detailNote = vehicle.isVariantOnly 
            ? `Variant order - ${group.vehicleModelName || 'Unknown'} (${group.color})` 
            : `VIN: ${vehicle.vin}`;
          if (orderNote) {
            detailNote = `${detailNote}. ${orderNote}`;
          }
          
          orderDetails.push({
            vehicleVariantId: group.variantId,
            vehicleId: vehicle.vehicleId, // null for variant-only items
            quantity: vehicle.quantity || 1,
            unitPrice: 0, // Price will be set after EVM Staff creates quotation
            discountPercent: 0,
            note: detailNote,
          });
        });
      });

      const orderData = {
        code: orderCode,
        customerId: null, // B2B order doesn't have customer
        dealerId: dealerId,
        createdByUserId: userId,
        status: 1, // AWAITING_DEPOSIT - Waiting for quotation from EVM Staff
        totalAmount: 0, // Will be set after quotation is accepted
        discountAmount: 0,
        finalAmount: 0, // Will be set after quotation is accepted
        expectedDeliveryAt: values.expectedDeliveryAt ? values.expectedDeliveryAt.toISOString() : null,
        orderType: 1, // B2B
        isFinanced: false,
        orderDetails: orderDetails,
      };

      await vehicleService.createOrderWithDetails(orderData);
      message.success("Đặt xe từ hãng thành công! Chờ EVM Staff báo giá.");
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

  // B2B orders don't have prices until quotation is created by EVM Staff

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
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#666" }}>
              Tổng số xe: {cartItems.length}
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
            <div style={{ fontSize: 12, color: "#999", marginTop: 8, textAlign: "center" }}>
              Giá sẽ được EVM Staff báo giá sau
            </div>
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
                      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                        Chờ báo giá
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
                            Giá sẽ được báo sau
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
          <Divider>Danh sách xe đặt hàng</Divider>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Tổng số xe: {cartItems.length}
            </div>
            {groupedItems().map((group, index) => (
              <div key={index} style={{ 
                padding: 12, 
                backgroundColor: "#f5f5f5", 
                borderRadius: 6, 
                marginBottom: 8 
              }}>
                <div style={{ fontWeight: 600 }}>
                  {group.vehicleModelName || "Unknown Model"}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {group.color} • Số lượng: {group.vehicles.reduce((sum, v) => sum + (v.quantity || 1), 0)}
                </div>
              </div>
            ))}
          </div>

          <Divider>Thông tin bổ sung</Divider>

          <Form.Item
            label="Ngày giao dự kiến"
            name="expectedDeliveryAt"
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < moment().startOf("day")}
              placeholder="Chọn ngày giao dự kiến (tùy chọn)"
            />
          </Form.Item>

          <Form.Item label="Ghi chú đơn hàng" name="note">
            <TextArea 
              rows={4} 
              placeholder="Ghi chú về yêu cầu đặc biệt, thời gian giao hàng, v.v... (tùy chọn)" 
            />
          </Form.Item>

          <Divider />

          <div style={{ marginBottom: 16, padding: 16, backgroundColor: "#fff7e6", borderRadius: 6, border: "1px solid #ffd591" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#d46b08", lineHeight: 1.6 }}>
              ℹ️ <strong>Lưu ý:</strong> Đơn hàng B2B sẽ được gửi đến EVM Staff để báo giá. 
              <br/>
              Bạn sẽ nhận được thông báo khi có báo giá và có thể xem chi tiết giá trước khi chấp nhận.
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
