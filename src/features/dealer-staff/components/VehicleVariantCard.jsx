import React from "react";
import { Card, Tag } from "antd";

const VehicleVariantCard = ({ variant, onClick }) => {
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
        cursor: isOutOfStock ? "not-allowed" : "pointer",
      }}
      cover={
        <div
          style={{
            height: 200,
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
                objectFit: "cover",
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
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {variant.color || "Không có màu"}
          </div>
        }
        description={
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1890ff", marginBottom: 8 }}>
              {formatPrice(variant.price)}
            </div>
            {variant.engine && (
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                Động cơ: {variant.engine}
              </div>
            )}
            {variant.batteryType && (
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                Pin: {variant.batteryType}
              </div>
            )}
            {variant.maximumSpeed && (
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                Tốc độ tối đa: {variant.maximumSpeed} km/h
              </div>
            )}
            <div style={{ fontSize: 14, fontWeight: 600, color: isOutOfStock ? "#ff4d4f" : "#52c41a", marginTop: 8 }}>
              {isOutOfStock ? "Hết hàng" : `Có sẵn: ${variant.availableStock} xe`}
            </div>
            <div style={{ fontSize: 13, color: "#999", marginTop: 4, fontStyle: "italic" }}>
              Nhấn để xem chi tiết và chọn xe
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default VehicleVariantCard;
