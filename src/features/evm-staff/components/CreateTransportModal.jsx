import React, { useState, useEffect } from "react";
import { X, Plus, Package } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const CreateTransportModal = ({ visible, preselectedOrderId, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
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

  // Pre-select order if preselectedOrderId is provided
  useEffect(() => {
    if (preselectedOrderId && orders.length > 0) {
      console.log('Pre-selecting order:', preselectedOrderId);
      setSelectedOrderId(preselectedOrderId);
    }
  }, [preselectedOrderId, orders]);

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
      const response = await axiosInstance.get(endpoints.warehouses.getAll, {
        params: { pageSize: 1000 },
      });
      const allWarehouses = response.data?.items || [];
      console.log('All warehouses fetched:', allWarehouses);
      setWarehouses(allWarehouses);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      showError("Không thể tải danh sách kho");
    }
  };

  // Filter only EVM warehouses for pickup location
  const evmWarehouses = warehouses.filter(warehouse => 
    warehouse.type === 'EVM' || warehouse.type === 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrderId) {
      showError("Vui lòng chọn một đơn hàng");
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
        orderId: selectedOrderId,
        providerName: formData.providerName || null,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        scheduledPickupAt: formData.scheduledPickupAt || null,
      };

      console.log('Creating transport with payload:', payload);
      await axiosInstance.post(endpoints.transports.create, payload);
      
      // Update selected order status to IN_TRANSIT
      console.log('Updating order status to IN_TRANSIT for order:', selectedOrderId);
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      
      if (selectedOrder) {
        try {
          // Build order update data with all non-null fields
          const orderUpdateData = {
            code: selectedOrder.code,
            dealerId: selectedOrder.dealerId,
            status: 'IN_TRANSIT', // Update status to IN_TRANSIT
            orderType: selectedOrder.orderType,
          };
          
          // Add optional fields if they exist
          if (selectedOrder.customerId) orderUpdateData.customerId = selectedOrder.customerId;
          if (selectedOrder.quotationId) orderUpdateData.quotationId = selectedOrder.quotationId;
          if (selectedOrder.handoverRecordId) orderUpdateData.handoverRecordId = selectedOrder.handoverRecordId;
          if (selectedOrder.contractId) orderUpdateData.contractId = selectedOrder.contractId;
          if (selectedOrder.depositId) orderUpdateData.depositId = selectedOrder.depositId;
          if (selectedOrder.note) orderUpdateData.note = selectedOrder.note;
          if (selectedOrder.totalAmount) orderUpdateData.totalAmount = selectedOrder.totalAmount;
          if (selectedOrder.discount) orderUpdateData.discount = selectedOrder.discount;
          if (selectedOrder.finalAmount) orderUpdateData.finalAmount = selectedOrder.finalAmount;
          if (selectedOrder.handoverDate) orderUpdateData.handoverDate = selectedOrder.handoverDate;
          
          console.log('Updating order', selectedOrder.id, 'with data:', orderUpdateData);
          await axiosInstance.put(endpoints.orders.update(selectedOrder.id), orderUpdateData);
        } catch (orderUpdateError) {
          console.error('Error updating order status:', selectedOrder.id, orderUpdateError);
        }
      }
      
      showSuccess("Tạo vận chuyển thành công! Trạng thái đơn hàng đã được cập nhật.");
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
    setSelectedOrderId(null);
    onClose();
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrderId(orderId);
  };

  // Get minimum datetime (tomorrow at 00:00)
  const getMinDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Format to YYYY-MM-DDTHH:mm in local timezone
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Auto-update dropoff location when order is selected
  useEffect(() => {
    if (selectedOrderId) {
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      
      if (selectedOrder) {
        // Get dealer address from order
        const dealerAddress = selectedOrder.dealer?.address;
        const dealerName = selectedOrder.dealer?.name;

        if (dealerAddress) {
          setFormData(prev => ({
            ...prev,
            dropoffLocation: dealerName ? `${dealerName} - ${dealerAddress}` : dealerAddress
          }));
        }
      }
    } else {
      // Clear dropoff location if no order selected
      setFormData(prev => ({
        ...prev,
        dropoffLocation: ""
      }));
    }
  }, [selectedOrderId, orders]);

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
                min={getMinDateTime()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chỉ có thể chọn thời gian từ ngày mai trở đi
              </p>
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
                {evmWarehouses.length === 0 ? (
                  <option value="" disabled>Không có kho EVM nào</option>
                ) : (
                  evmWarehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.address}>
                      {warehouse.name} - {warehouse.address}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Chỉ hiển thị các kho trung tâm EVM ({evmWarehouses.length} kho)
              </p>
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
                      Chọn
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
                          selectedOrderId === order.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleOrderSelection(order.id)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="radio"
                            checked={selectedOrderId === order.id}
                            onChange={() => handleOrderSelection(order.id)}
                            className="border-gray-300"
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
            {selectedOrderId && (
              <p className="text-sm text-blue-600 mt-2">
                Đã chọn đơn hàng: {orders.find(o => o.id === selectedOrderId)?.code || 'N/A'}
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
              disabled={loading || !selectedOrderId}
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

