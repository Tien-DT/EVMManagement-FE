import React from "react";
import { Card, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const VehicleModelCard = ({ model, basePath = "/dealer-staff/vehicles" }) => {
  const navigate = useNavigate();
  const isOutOfStock = !model.availableStock || model.availableStock === 0;

  const handleClick = () => {
    navigate(`${basePath}/${model.id}/variants`);
  };

  return (
    <Card
      hoverable={true}
      onClick={handleClick}
      style={{
        opacity: isOutOfStock ? 0.75 : 1,
        cursor: "pointer",
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
          {model.imageUrl ? (
            <img
              alt={model.name}
              src={model.imageUrl}
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
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {model.name}
          </div>
        }
        description={
          <div>
            <div style={{ color: "#666", marginBottom: 3, fontSize: 12 }}>
              Mã: {model.code}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1890ff", marginBottom: 3 }}>
              Số lượng: {model.availableStock || 0} xe
            </div>
            {model.description && (
              <div
                style={{
                  fontSize: 12,
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
