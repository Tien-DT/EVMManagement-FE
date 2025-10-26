import React, { useState, useEffect } from "react";
import { Modal, Spin, Empty, Row, Col, Descriptions, Button, message, List, Tag } from "antd";
import { ShoppingCartOutlined, CarOutlined } from "@ant-design/icons";
import { vehicleService } from "../services/vehicleService";

const VehicleVariantDetailModal = ({ visible, onClose, variant, dealerId, onAddVehicleToCart }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      0: "success",
      1: "warning",
      2: "processing",
      3: "default",
    };
    return statusMap[status] || "default";
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: "Còn hàng",
      1: "Đã đặt",
      2: "Đang vận chuyển",
      3: "Đã bán",
    };
    return statusMap[status] || "Không xác định";
  };

  useEffect(() => {
    if (visible && variant && dealerId) {
      fetchVehicles();
    }
  }, [visible, variant, dealerId]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getVehiclesByDealerAndVariant(
        dealerId,
        variant.id,
        1,
        100
      );

      let vehiclesData = [];
      if (response?.data) {
        if (Array.isArray(response.data.items)) {
          vehiclesData = response.data.items;
        } else if (Array.isArray(response.data)) {
          vehiclesData = response.data;
        }
      }

      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      message.error("Không thể tải danh sách xe");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = (vehicle) => {
    onAddVehicleToCart({
      vehicleId: vehicle.id,
      vin: vehicle.vin,
      variantId: variant.id,
      color: variant.color,
      price: variant.price,
      imageUrl: vehicle.imageUrl || variant.imageUrl,
      engine: variant.engine,
      batteryType: variant.batteryType,
    });
    message.success(`Đã thêm xe ${vehicle.vin} vào giỏ hàng`);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      title={<span style={{ fontSize: 20, fontWeight: 600 }}>Chi tiết biến thể xe</span>}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            {variant?.imageUrl ? (
              <img
                src={variant.imageUrl}
                alt={variant.color}
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            ) : (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 64 }}>🚙</span>
              </div>
            )}
          </div>

          <Descriptions title="Thông số kỹ thuật" bordered column={2}>
            <Descriptions.Item label="Màu sắc">
              {variant?.color || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              {variant?.price ? formatPrice(variant.price) : "Liên hệ"}
            </Descriptions.Item>
            <Descriptions.Item label="Động cơ">
              {variant?.engine || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Dung tích">
              {variant?.capacity ? `${variant.capacity} kWh` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại pin">
              {variant?.batteryType || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Tuổi thọ pin">
              {variant?.batteryLife || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sạc">
              {variant?.chargingTime ? `${variant.chargingTime} giờ` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Công suất sạc">
              {variant?.chargingCapacity ? `${variant.chargingCapacity} kW` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Tốc độ tối đa">
              {variant?.maximumSpeed ? `${variant.maximumSpeed} km/h` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Quãng đường/lần sạc">
              {variant?.distancePerCharge ? `${variant.distancePerCharge} km` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Trọng lượng">
              {variant?.weight ? `${variant.weight} kg` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Khoảng sáng gầm">
              {variant?.groundClearance ? `${variant.groundClearance} mm` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Phanh">
              {variant?.brakes || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Giảm xóc">
              {variant?.shockAbsorbers || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Chiều dài">
              {variant?.length ? `${variant.length} mm` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Chiều rộng">
              {variant?.width ? `${variant.width} mm` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Chiều cao">
              {variant?.height ? `${variant.height} mm` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Kích thước cốp">
              {variant?.trunkWidth ? `${variant.trunkWidth} mm` : "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {variant?.description || "Không có thông tin"}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={24}>
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Xe có sẵn ({vehicles.length})
            </h3>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
              </div>
            ) : vehicles.length === 0 ? (
              <Empty description="Không có xe nào trong kho" />
            ) : (
              <List
                dataSource={vehicles}
                bordered
                renderItem={(vehicle) => (
                  <List.Item
                    style={{
                      padding: "16px",
                      marginBottom: "8px",
                      backgroundColor: "#fafafa",
                      borderRadius: "8px",
                      border: "1px solid #d9d9d9"
                    }}
                    actions={[
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddVehicle(vehicle)}
                        style={{
                          backgroundColor: "#52c41a",
                          borderColor: "#52c41a",
                          fontWeight: 600
                        }}
                      >
                        Thêm vào giỏ
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<CarOutlined style={{ fontSize: 32, color: "#1890ff" }} />}
                      title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>VIN: {vehicle.vin}</span>
                          <Tag color={getStatusColor(vehicle.status)}>
                            {getStatusText(vehicle.status)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div style={{ fontSize: 13, color: "#666" }}>
                          {vehicle.imageUrl && (
                            <img
                              src={vehicle.imageUrl}
                              alt={vehicle.vin}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 4,
                                marginTop: 8,
                              }}
                            />
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default VehicleVariantDetailModal;
