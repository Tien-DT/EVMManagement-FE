// src/features/dealer-staff/components/CheckInOutModal.jsx
import React, { useState, useEffect } from "react";
import { X, Clock, CheckCircle, AlertCircle } from "lucide-react";

const CheckInOutModal = ({ isOpen, onClose, booking, onUpdate, isSubmitting }) => {
  const [checkinAt, setCheckinAt] = useState("");
  const [checkoutAt, setCheckoutAt] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState(null); // 'checkin', 'checkout', 'manual'

  useEffect(() => {
    if (isOpen && booking) {
      // Set current values if available
      setCheckinAt(
        booking.checkinAt
          ? new Date(booking.checkinAt).toISOString().slice(0, 16)
          : ""
      );
      setCheckoutAt(
        booking.checkoutAt
          ? new Date(booking.checkoutAt).toISOString().slice(0, 16)
          : ""
      );
      setError("");
      setAction(null);
    }
  }, [isOpen, booking]);

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleQuickCheckIn = () => {
    const now = getCurrentDateTime();
    setCheckinAt(now);
    // Don't clear checkoutAt in UI, but it will be set to null in the request
    setAction("checkin");
    setError("");
  };

  const handleQuickCheckOut = () => {
    const now = getCurrentDateTime();
    setCheckoutAt(now);
    // Don't clear checkinAt in UI, but it will be set to null in the request
    setAction("checkout");
    setError("");
  };

  const handleManualUpdate = () => {
    setAction("manual");
  };

  const validate = () => {
    // For quick actions (check-in or check-out), validation is simpler
    if (action === "checkin") {
      if (!checkinAt) {
        setError("Vui lòng nhập thời gian check-in");
        return false;
      }
    } else if (action === "checkout") {
      if (!checkoutAt) {
        setError("Vui lòng nhập thời gian check-out");
        return false;
      }
    } else {
      // Manual update: validate both if provided
      if (!checkinAt && !checkoutAt) {
        setError("Vui lòng nhập ít nhất một thời gian");
        return false;
      }

      if (checkinAt && checkoutAt) {
        const checkin = new Date(checkinAt);
        const checkout = new Date(checkoutAt);
        if (checkout < checkin) {
          setError("Thời gian check-out phải sau thời gian check-in");
          return false;
        }
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    // Logic: 
    // - Check-in: only send checkinAt, checkoutAt = null
    // - Check-out: only send checkoutAt, checkinAt = null
    let checkin = null;
    let checkout = null;

    if (action === "checkin") {
      // Check-in: chỉ gửi checkinAt, checkoutAt = null
      if (!checkinAt) {
        setError("Vui lòng nhập thời gian check-in");
        return;
      }
      checkin = new Date(checkinAt).toISOString();
      checkout = null; // Always null when check-in
    } else if (action === "checkout") {
      // Check-out: chỉ gửi checkoutAt, checkinAt = null
      if (!checkoutAt) {
        setError("Vui lòng nhập thời gian check-out");
        return;
      }
      checkout = new Date(checkoutAt).toISOString();
      checkin = null; // Always null when check-out
    } else {
      // If no action set, determine from which field is filled
      if (checkinAt && !checkoutAt) {
        // Only check-in filled -> treat as check-in
        checkin = new Date(checkinAt).toISOString();
        checkout = null;
      } else if (checkoutAt && !checkinAt) {
        // Only check-out filled -> treat as check-out
        checkout = new Date(checkoutAt).toISOString();
        checkin = null;
      } else {
        // Both filled or both empty -> error
        setError("Vui lòng chỉ nhập một trường: check-in hoặc check-out");
        return;
      }
    }

    onUpdate(booking.id, checkin, checkout, action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cập nhật Check-in/Check-out</h2>
            <p className="text-sm text-gray-600 mt-1">
              Booking ID: {booking?.id?.substring(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <Clock className="mr-2" size={16} />
              Thao tác nhanh
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleQuickCheckIn}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <CheckCircle className="inline-block mr-2" size={16} />
                Check-in ngay
              </button>
              <button
                onClick={handleQuickCheckOut}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <CheckCircle className="inline-block mr-2" size={16} />
                Check-out ngay
              </button>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian Check-in
              </label>
              <input
                type="datetime-local"
                value={checkinAt}
                onChange={(e) => {
                  setCheckinAt(e.target.value);
                  // If user manually changes check-in, set action to checkin
                  // This will override checkout action if both are filled
                  if (e.target.value) {
                    setAction("checkin");
                  }
                  setError("");
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {checkinAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(checkinAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian Check-out
              </label>
              <input
                type="datetime-local"
                value={checkoutAt}
                onChange={(e) => {
                  setCheckoutAt(e.target.value);
                  // If user manually changes check-out, set action to checkout
                  // This will override checkin action if both are filled
                  if (e.target.value) {
                    setAction("checkout");
                  }
                  setError("");
                }}
                min={checkinAt || undefined}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {checkoutAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(checkoutAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          </div>

          {/* Current Values Display */}
          {(booking?.checkinAt || booking?.checkoutAt) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Giá trị hiện tại</h3>
              <div className="space-y-2 text-sm">
                {booking.checkinAt && (
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="mr-2 text-green-500" size={16} />
                    <span>Check-in: {new Date(booking.checkinAt).toLocaleString("vi-VN")}</span>
                  </div>
                )}
                {booking.checkoutAt && (
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="mr-2 text-orange-500" size={16} />
                    <span>Check-out: {new Date(booking.checkoutAt).toLocaleString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Info */}
          {action && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                {action === "checkin" && "✓ Chế độ Check-in: Chỉ cập nhật thời gian check-in, check-out sẽ được set về null"}
                {action === "checkout" && "✓ Chế độ Check-out: Chỉ cập nhật thời gian check-out, check-in sẽ được set về null"}
                {action === "manual" && "📝 Chế độ cập nhật thủ công: Có thể cập nhật cả hai trường"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !checkinAt && !checkoutAt}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutModal;
