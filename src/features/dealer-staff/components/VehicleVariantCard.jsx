import React from "react";
import { Card, Tag, Button } from "antd";
import { ShoppingCartOutlined, CalendarOutlined } from "@ant-design/icons";

const VehicleVariantCard = ({ variant, onClick, onPreOrder, hidePreOrder = false, isB2BMode = false, onAddToB2BCart }) => {
  const isOutOfStock = !variant.availableStock || variant.availableStock === 0;

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card
      hoverable={!isOutOfStock}
      onClick={isOutOfStock ? undefined : () => onClick(variant)}
      style={{
        opacity: isOutOfStock ? 0.6 : 1,
        cursor: isOutOfStock ? "default" : "pointer",
        height: "100%",
      }}
      bodyStyle={{ padding: "12px" }}
      cover={
        <div
          style={{
            height: 140,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            position: "relative",
          }}
        >
          {variant.imageUrl ? (
            <img
              alt={variant.color || "Vehicle"}
              src={variant.imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 48,
                color: "#d9d9d9",
              }}
            >
              🚙
            </div>
          )}
          {isOutOfStock && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
              }}
            >
              <Tag color="red">Hết hàng</Tag>
            </div>
          )}
        </div>
      }
    >
      <Card.Meta
        title={
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {variant.color || "Không có màu"}
          </div>
        }
        description={
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1890ff", marginBottom: 6 }}>
              {formatPrice(variant.price)}
            </div>
            {variant.engine && (
              <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>
                Động cơ: {variant.engine}
              </div>
            )}
            {variant.batteryType && (
              <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>
                Pin: {variant.batteryType}
              </div>
            )}
            {variant.maximumSpeed && (
              <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>
                Tốc độ tối đa: {variant.maximumSpeed} km/h
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: isOutOfStock ? "#ff4d4f" : "#52c41a", marginTop: 6 }}>
              {isOutOfStock ? "Hết hàng" : `Có sẵn: ${variant.availableStock} xe`}
            </div>
            
            {isB2BMode ? (
              <div style={{ marginTop: 10 }}>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToB2BCart && onAddToB2BCart(variant);
                  }}
                  block
                  size="small"
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    fontWeight: 600,
                  }}
                >
                  Đặt từ hãng
                </Button>
                <div style={{ fontSize: 11, color: "#999", marginTop: 4, textAlign: "center", fontStyle: "italic" }}>
                  {isOutOfStock ? "Đặt xe từ nhà sản xuất" : `Còn ${variant.availableStock} xe - Đặt thêm từ hãng`}
                </div>
              </div>
            ) : isOutOfStock && !hidePreOrder ? (
              <div style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreOrder && onPreOrder(variant);
                  }}
                  block
                  style={{
                    backgroundColor: "#fa8c16",
                    borderColor: "#fa8c16",
                    fontWeight: 600,
                  }}
                >
                  Đặt trước
                </Button>
                <div style={{ fontSize: 12, color: "#999", marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
                  Đặt cọc 10% để giữ xe khi có hàng
                </div>
              </div>
            ) : !isOutOfStock ? (
              <div style={{ fontSize: 13, color: "#999", marginTop: 8, fontStyle: "italic" }}>
                Nhấn để xem chi tiết và chọn xe
              </div>
            ) : null}
          </div>
        }
      />
    </Card>
  );
};

export default VehicleVariantCard;
