// src/features/dealer-staff/pages/CartPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
  } = useCart();

  const handleQuantityChange = (vehicleId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(vehicleId, { quantity: newQuantity });
  };

  const handleDiscountChange = (vehicleId, newDiscount) => {
    if (newDiscount < 0 || newDiscount > 100) return;
    updateCartItem(vehicleId, { discountPercent: newDiscount });
  };

  const handleNoteChange = (vehicleId, newNote) => {
    updateCartItem(vehicleId, { note: newNote });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateItemTotal = (item) => {
    return (
      item.variant.price *
      item.quantity *
      ((100 - item.discountPercent) / 100)
    );
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      return;
    }
    
    // Navigate to create order page with cart data
    navigate("/dealer-staff/orders/create", {
      state: { fromCart: true, cartItems },
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dealer-staff/vehicles/models")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Quay lại danh sách xe</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Chưa có xe nào trong giỏ hàng của bạn
            </p>
            <button
              onClick={() => navigate("/dealer-staff/vehicles/models")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Thêm xe vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/dealer-staff/vehicles/models")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Tiếp tục mua sắm</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Giỏ hàng ({cartItems.length} xe)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="inline-flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} className="mr-2" />
          Xóa tất cả
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.vehicle.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex gap-6">
              {/* Vehicle Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.variant.color || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      VIN: {item.vehicle.vin}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.vehicle.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Price Info */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">Đơn giá:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(item.variant.price)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.vehicle.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.vehicle.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.vehicle.id,
                            item.quantity + 1
                          )
                        }
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giảm giá (%)
                    </label>
                    <input
                      type="number"
                      value={item.discountPercent}
                      onChange={(e) =>
                        handleDiscountChange(
                          item.vehicle.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  {/* Subtotal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành tiền
                    </label>
                    <div className="text-xl font-bold text-green-600 py-2">
                      {formatPrice(calculateItemTotal(item))}
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={item.note}
                    onChange={(e) =>
                      handleNoteChange(item.vehicle.id, e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                    rows="2"
                    placeholder="Thêm ghi chú cho xe này..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tổng cộng</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tổng giá trị đơn hàng sau khi áp dụng giảm giá
            </p>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatPrice(getCartTotal())}
          </div>
        </div>

        {/* Warning for temporary single item */}
        {cartItems.length > 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Lưu ý</p>
                <p>
                  Do API hiện tại chưa hỗ trợ tạo nhiều order details cùng lúc,
                  hệ thống sẽ chỉ tạo order với xe đầu tiên trong giỏ hàng để
                  test luồng.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleCreateOrder}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg flex items-center justify-center gap-2"
        >
          <Package size={20} />
          Tạo đơn hàng
        </button>
      </div>
    </div>
  );
};

export default CartPage;
