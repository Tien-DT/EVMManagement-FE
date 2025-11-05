import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const AddVehiclesToWarehouseModal = ({ isOpen, onClose, warehouseId, dealerId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [vinInputs, setVinInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load completed B2B orders
  useEffect(() => {
    if (isOpen && dealerId) {
      loadOrders();
    }
  }, [isOpen, dealerId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('Loading completed B2B orders for dealerId:', dealerId);
      
      // Use filter endpoint for better performance
      const response = await axiosInstance.get(endpoints.orders.filter, {
        params: {
          dealerId: dealerId,
          pageNumber: 1,
          pageSize: 100,
        }
      });
      
      console.log('Orders API response:', response);
      
      // Extract orders from response
      let ordersList = [];
      if (response.data?.items) {
        ordersList = response.data.items;
      } else if (response.data?.data?.items) {
        ordersList = response.data.data.items;
      } else if (Array.isArray(response.data?.data)) {
        ordersList = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersList = response.data;
      }
      
      console.log('Extracted orders list:', ordersList);
      
      // Filter B2B orders with PAY_SUCCESS status
      const completedB2BOrders = ordersList.filter(order => {
        const isB2B = order.orderType === 1 || order.orderType === 'B2B' || String(order.orderType).toUpperCase() === 'B2B';
        const isPaid = order.status?.toUpperCase() === 'PAY_SUCCESS';
        console.log(`Order ${order.code}: isB2B=${isB2B}, isPaid=${isPaid}, orderType=${order.orderType}, status=${order.status}`);
        return isB2B && isPaid;
      });
      
      console.log('Filtered PAY_SUCCESS B2B orders:', completedB2BOrders);
      
      if (completedB2BOrders.length === 0) {
        console.warn('No PAY_SUCCESS B2B orders found. Total orders loaded:', ordersList.length);
      }
      
      setOrders(completedB2BOrders);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      console.error('Error details:', error.response?.data);
      alert('Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Load order details and extract vehicles
  const handleOrderSelect = async (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      setVehicles([]);
      setSelectedVehicles([]);
      setVinInputs({});
      return;
    }

    setLoading(true);
    try {
      console.log('Loading order details for orderId:', orderId);
      
      // Load order WITH DETAILS - this endpoint includes orderDetails
      const response = await axiosInstance.get(endpoints.orders.getByIdWithDetails(orderId));
      
      console.log('Order API response:', response);
      
      // Handle response structure - could be response.data or response.data.data
      let order = response.data?.data || response.data;
      
      console.log('Order details:', order);
      
      setSelectedOrder(order);
      
      // Extract vehicles from orderDetails
      console.log('Checking orderDetails:', order.orderDetails);
      console.log('orderDetails length:', order.orderDetails?.length);
      
      if (order.orderDetails && order.orderDetails.length > 0) {
        const vehiclesList = order.orderDetails
          .filter(detail => detail.vehicleVariantId || detail.vehicleVariant?.id)
          .map((detail, index) => {
            const variantId = detail.vehicleVariantId || detail.vehicleVariant?.id;
            const variant = detail.vehicleVariant;
            
            console.log('Processing detail:', {
              detailId: detail.id,
              variantId: variantId,
              variant: variant
            });
            
            return {
              id: `${detail.id}-${index}`,
              orderDetailId: detail.id,
              variantId: variantId,
              vehicleVariant: variant,
              quantity: detail.quantity || 1,
              modelName: variant?.vehicleModel?.name || variant?.model?.name || 'Unknown Model',
              color: variant?.color || 'N/A',
              price: detail.unitPrice || variant?.price || 0,
              imageUrl: variant?.imageUrl || '',
            };
          });
        
        console.log('Extracted vehicles:', vehiclesList);
        
        if (vehiclesList.length > 0) {
          setVehicles(vehiclesList);
        } else {
          setVehicles([]);
          alert('Không tìm thấy thông tin xe trong đơn hàng này');
        }
      } else {
        console.warn('No orderDetails found in order:', order);
        setVehicles([]);
        alert('Đơn hàng này không có xe nào');
      }
      
    } catch (error) {
      console.error('Error loading order details:', error);
      alert('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        // Remove from selection
        const newVinInputs = { ...vinInputs };
        delete newVinInputs[vehicleId];
        setVinInputs(newVinInputs);
        return prev.filter(id => id !== vehicleId);
      } else {
        // Add to selection
        return [...prev, vehicleId];
      }
    });
  };

  // Select all vehicles
  const handleSelectAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      // Deselect all
      setSelectedVehicles([]);
      setVinInputs({});
    } else {
      // Select all
      setSelectedVehicles(vehicles.map(v => v.id));
    }
  };

  // Update VIN input
  const handleVinChange = (vehicleId, vin) => {
    setVinInputs(prev => ({
      ...prev,
      [vehicleId]: vin
    }));
  };

  // Submit - Add vehicles to warehouse
  const handleSubmit = async () => {
    // Validate
    if (selectedVehicles.length === 0) {
      alert('Vui lòng chọn ít nhất một xe');
      return;
    }

    // Check VIN for all selected vehicles
    const missingVin = selectedVehicles.filter(vehicleId => !vinInputs[vehicleId]?.trim());
    if (missingVin.length > 0) {
      alert('Vui lòng nhập VIN cho tất cả xe đã chọn');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Adding vehicles to warehouse...');
      
      // Build vehicles array
      const vehiclesPayload = selectedVehicles.map(vehicleId => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return {
          variantId: vehicle.variantId,
          vin: vinInputs[vehicleId].trim(),
          status: 'IN_STOCK',
          purpose: 'FOR_SALE',
          imageUrl: vehicle.imageUrl || ''
        };
      });

      const payload = {
        warehouseId: warehouseId,
        dealerId: dealerId,
        vehicles: vehiclesPayload
      };

      console.log('Payload:', payload);

      // Call API using endpoint from endpoints.js
      const response = await axiosInstance.post(
        endpoints.warehouses.dealer.addVehicles,
        payload
      );

      console.log('Response:', response);

      alert(`Đã thêm ${selectedVehicles.length} xe vào kho thành công!`);
      
      // Update order status to COMPLETED
      if (selectedOrder?.id) {
        try {
          console.log('Updating order status to COMPLETED...');
          
          // Build order update payload with all required fields
          const orderUpdateData = {
            code: selectedOrder.code,
            dealerId: selectedOrder.dealerId,
            status: 'COMPLETED',
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
          if (selectedOrder.discountAmount) orderUpdateData.discountAmount = selectedOrder.discountAmount;
          if (selectedOrder.finalAmount) orderUpdateData.finalAmount = selectedOrder.finalAmount;
          if (selectedOrder.handoverDate) orderUpdateData.handoverDate = selectedOrder.handoverDate;
          if (selectedOrder.expectedDeliveryAt) orderUpdateData.expectedDeliveryAt = selectedOrder.expectedDeliveryAt;
          
          console.log('Order update payload:', orderUpdateData);
          
          await axiosInstance.put(
            endpoints.orders.update(selectedOrder.id),
            orderUpdateData
          );
          
          console.log('Order status updated to COMPLETED successfully');
        } catch (orderError) {
          console.error('Error updating order status:', orderError);
          alert('Đã thêm xe vào kho nhưng không thể cập nhật trạng thái đơn hàng');
        }
      }
      
      // Reset and close
      setSelectedOrder(null);
      setVehicles([]);
      setSelectedVehicles([]);
      setVinInputs({});
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error adding vehicles to warehouse:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Không thể thêm xe vào kho';
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Thêm xe vào kho</h2>
              <p className="text-sm text-blue-100">Chọn đơn hàng và xe để thêm vào kho</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Order Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chọn đơn hàng (B2B - Đã thanh toán) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
              disabled={loading}
            >
              <option value="">-- Chọn đơn hàng --</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.code} - {order.dealerName || order.dealer?.name || 'N/A'} ({order.orderDetails?.length || 0} xe)
                </option>
              ))}
            </select>
            {loading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <Loader2 size={16} className="animate-spin" />
                <span>Đang tải...</span>
              </div>
            )}
          </div>

          {/* Vehicles List */}
          {vehicles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-700">
                  Chọn xe ({selectedVehicles.length}/{vehicles.length})
                </label>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {selectedVehicles.length === vehicles.length ? (
                    <>
                      <Square size={16} />
                      <span>Bỏ chọn tất cả</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare size={16} />
                      <span>Chọn tất cả</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      selectedVehicles.includes(vehicle.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleVehicleSelection(vehicle.id)}
                        className="mt-1"
                      >
                        {selectedVehicles.includes(vehicle.id) ? (
                          <CheckSquare size={24} className="text-blue-600" />
                        ) : (
                          <Square size={24} className="text-gray-400" />
                        )}
                      </button>

                      {/* Vehicle Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {vehicle.imageUrl ? (
                          <img
                            src={vehicle.imageUrl}
                            alt={vehicle.modelName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{vehicle.modelName}</h4>
                        <p className="text-sm text-gray-600">
                          Màu: {vehicle.color} | Giá: {vehicle.price.toLocaleString('vi-VN')} ₫
                        </p>

                        {/* VIN Input (only show if selected) */}
                        {selectedVehicles.includes(vehicle.id) && (
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              VIN (Số khung) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={vinInputs[vehicle.id] || ''}
                              onChange={(e) => handleVinChange(vehicle.id, e.target.value)}
                              placeholder="Nhập số VIN"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedOrder && vehicles.length === 0 && !loading && (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Đơn hàng này không có xe nào</p>
            </div>
          )}

          {/* Info */}
          {selectedVehicles.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Thông tin xe sẽ được thêm:</p>
                  <ul className="space-y-1">
                    <li>• Trạng thái: <strong>IN_STOCK</strong> (Có sẵn trong kho)</li>
                    <li>• Mục đích: <strong>FOR_SALE</strong> (Để bán)</li>
                    <li>• Số lượng đã chọn: <strong>{selectedVehicles.length} xe</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedVehicles.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Thêm {selectedVehicles.length} xe vào kho</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehiclesToWarehouseModal;
