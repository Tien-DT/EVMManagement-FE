import React from "react";
import { Card, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const VehicleModelCard = ({ model }) => {
  const navigate = useNavigate();
  const isOutOfStock = !model.availableStock || model.availableStock === 0;

  const handleClick = () => {
    navigate(`/dealer-staff/vehicles/${model.id}/variants`);
  };

  return (
    <Card
      hoverable={!isOutOfStock}
      onClick={handleClick}
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
          {model.imageUrl ? (
            <img
              alt={model.name}
              src={model.imageUrl}
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
              🚗
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
            }}
          >
            <Tag color={isOutOfStock ? "red" : "green"}>
              {isOutOfStock ? "Hết hàng" : "Có sẵn"}
            </Tag>
          </div>
        </div>
      }
    >
      <Card.Meta
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {model.name}
          </div>
        }
        description={
          <div>
            <div style={{ color: "#666", marginBottom: 4 }}>
              Mã: {model.code}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1890ff", marginBottom: 4 }}>
              Số lượng: {model.availableStock || 0} xe
            </div>
            {model.description && (
              <div
                style={{
                  fontSize: 13,
                  color: "#999",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {model.description}
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default VehicleModelCard;
