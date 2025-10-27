import React, { useState, useEffect } from "react";
import { X, Plus, Package } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const CreateTransportModal = ({ visible, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [formData, setFormData] = useState({
    providerName: "",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledPickupAt: "",
  });

  useEffect(() => {
    if (visible) {
      fetchEligibleOrders();
      fetchWarehouses();
    }
  }, [visible]);

  const fetchEligibleOrders = async () => {
    try {
      // Fetch all B2B orders with IN_PROGRESS status
      const response = await axiosInstance.get(endpoints.orders.getAll, {
        params: {
          orderType: 1, // B2B
          pageSize: 1000, // Get all
        },
      });

      // Filter for IN_PROGRESS status
      const eligibleOrders = (response.data?.items || []).filter(
        (order) => order.status === "IN_PROGRESS" || order.status === 4
      );

      setOrders(eligibleOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Không thể tải danh sách đơn hàng");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axiosInstance.get(endpoints.dealer.warehouses, {
        params: { pageSize: 1000 },
      });
      setWarehouses(response.data?.items || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      showError("Không thể tải danh sách kho");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedOrderIds.length === 0) {
      showError("Vui lòng chọn ít nhất một đơn hàng");
      return;
    }

    // Validate all orders are from the same dealer
    const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));
    const dealerIds = [...new Set(selectedOrders.map(order => order.dealerId))];

    if (dealerIds.length > 1) {
      showError("Tất cả đơn hàng phải cùng một đại lý");
      return;
    }

    if (!formData.pickupLocation) {
      showError("Vui lòng chọn điểm lấy hàng");
      return;
    }

    if (!formData.dropoffLocation) {
      showError("Vui lòng chọn điểm giao hàng");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderIds: selectedOrderIds,
        providerName: formData.providerName || null,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        scheduledPickupAt: formData.scheduledPickupAt || null,
      };

      await axiosInstance.post(endpoints.transports.create, payload);
      showSuccess("Tạo vận chuyển thành công!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating transport:", error);
      showError(error.response?.data?.message || "Không thể tạo vận chuyển");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      providerName: "",
      pickupLocation: "",
      dropoffLocation: "",
      scheduledPickupAt: "",
    });
    setSelectedOrderIds([]);
    onClose();
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Auto-update dropoff location when orders are selected
  useEffect(() => {
    if (selectedOrderIds.length > 0) {
      // Get unique dealer IDs from selected orders
      const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));
      const dealerIds = [...new Set(selectedOrders.map(order => order.dealerId))];

      if (dealerIds.length === 1) {
        // If all selected orders are from the same dealer, auto-fill dropoff location
        const firstOrder = selectedOrders[0];

        // Get dealer address from order
        const dealerAddress = firstOrder.dealer?.address;
        const dealerName = firstOrder.dealer?.name;

        if (dealerAddress) {
          setFormData(prev => ({
            ...prev,
            dropoffLocation: dealerName ? `${dealerName} - ${dealerAddress}` : dealerAddress
          }));
        }
      } else if (dealerIds.length > 1) {
        // If orders are from multiple dealers, show warning
        showError("Các đơn hàng phải cùng một đại lý");
        // Clear dropoff location
        setFormData(prev => ({
          ...prev,
          dropoffLocation: ""
        }));
      }
    } else {
      // Clear dropoff location if no orders selected
      setFormData(prev => ({
        ...prev,
        dropoffLocation: ""
      }));
    }
  }, [selectedOrderIds, orders]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Plus size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tạo vận chuyển mới</h3>
              <p className="text-sm text-gray-500">Chọn đơn hàng và điền thông tin vận chuyển</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transport Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhà cung cấp
              </label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) =>
                  setFormData({ ...formData, providerName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tên nhà cung cấp vận chuyển"
              />
            </div>

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
                Điểm lấy hàng (Kho EVM) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
                Điểm giao hàng (Đại lý) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dropoffLocation}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Tự động điền khi chọn đơn hàng"
              />
              <p className="text-xs text-gray-500 mt-1">
                Địa chỉ sẽ tự động điền khi bạn chọn đơn hàng
              </p>
            </div>
          </div>

          {/* Orders Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn đơn hàng (Chỉ hiển thị đơn B2B đang xử lý)
            </label>
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length === orders.length && orders.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds(orders.map((o) => o.id));
                          } else {
                            setSelectedOrderIds([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Mã đơn
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Dealer
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Số lượng xe
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        <Package size={32} className="mx-auto mb-2 text-gray-400" />
                        <p>Không có đơn hàng nào đủ điều kiện</p>
                        <p className="text-xs mt-1">
                          (Chỉ hiển thị đơn B2B với trạng thái "Đang xử lý")
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedOrderIds.includes(order.id) ? "bg-blue-50" : ""
                        }`}
                        onClick={() => toggleOrderSelection(order.id)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-mono">{order.code}</td>
                        <td className="px-4 py-2 text-sm">
                          {order.dealer?.name || order.dealerName || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {order.orderDetails?.length || 0}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {order.createdDate
                            ? new Date(order.createdDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {selectedOrderIds.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                Đã chọn {selectedOrderIds.length} đơn hàng
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedOrderIds.length === 0}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Tạo vận chuyển
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransportModal;

