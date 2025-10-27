import React, { useState, useEffect } from "react";
import { X, Truck } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const UpdateTransportStatusModal = ({ visible, onClose, transport, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [formData, setFormData] = useState({
    status: transport?.status ?? 0,
    providerName: transport?.providerName || "",
    pickupLocation: transport?.pickupLocation || "",
    dropoffLocation: transport?.dropoffLocation || "",
    scheduledPickupAt: transport?.scheduledPickupAt
      ? new Date(transport.scheduledPickupAt).toISOString().slice(0, 16)
      : "",
    deliveredAt: transport?.deliveredAt
      ? new Date(transport.deliveredAt).toISOString().slice(0, 16)
      : "",
  });

  useEffect(() => {
    if (visible) {
      fetchWarehouses();
      fetchDealers();
    }
  }, [visible]);

  const fetchWarehouses = async () => {
    try {
      const response = await axiosInstance.get(endpoints.dealer.warehouses, {
        params: { pageSize: 1000 },
      });
      setWarehouses(response.data?.items || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await axiosInstance.get(endpoints.admin.dealers, {
        params: { pageSize: 1000 },
      });
      setDealers(response.data?.items || []);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    }
  };

  const statusOptions = [
    { value: 0, label: "Chờ xử lý", color: "orange" },
    { value: 1, label: "Đang vận chuyển", color: "blue" },
    { value: 2, label: "Hoàn thành", color: "green" },
    { value: 3, label: "Đã hủy", color: "red" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        status: parseInt(formData.status),
        providerName: formData.providerName || null,
        pickupLocation: formData.pickupLocation || null,
        dropoffLocation: formData.dropoffLocation || null,
        scheduledPickupAt: formData.scheduledPickupAt || null,
        deliveredAt: formData.deliveredAt || null,
      };

      await axiosInstance.put(endpoints.transports.update(transport.id), payload);
      showSuccess("Cập nhật vận chuyển thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating transport:", error);
      showError(error.response?.data?.message || "Không thể cập nhật vận chuyển");
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !transport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Truck size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật vận chuyển</h3>
              <p className="text-sm text-gray-500">
                ID: <span className="font-mono">{transport.id}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà cung cấp
            </label>
            <input
              type="text"
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tên nhà cung cấp vận chuyển"
            />
          </div>

          {/* Pickup & Dropoff */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm lấy hàng (Kho EVM)
              </label>
              <select
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.address}>
                    {warehouse.name} - {warehouse.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm giao hàng (Đại lý)
              </label>
              <select
                value={formData.dropoffLocation}
                onChange={(e) =>
                  setFormData({ ...formData, dropoffLocation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn đại lý --</option>
                {dealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.address}>
                    {dealer.name} - {dealer.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheduled Pickup & Delivered At */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian lấy hàng
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledPickupAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledPickupAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian giao hàng
              </label>
              <input
                type="datetime-local"
                value={formData.deliveredAt}
                onChange={(e) =>
                  setFormData({ ...formData, deliveredAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Transport Details Info */}
          {transport.transportDetails && transport.transportDetails.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Thông tin vận chuyển
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Số lượng xe: {transport.transportDetails.length}</p>
                <p>
                  Đơn hàng:{" "}
                  {[...new Set(transport.transportDetails.map((td) => td.orderCode))].join(
                    ", "
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Truck size={16} />
                  Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTransportStatusModal;

