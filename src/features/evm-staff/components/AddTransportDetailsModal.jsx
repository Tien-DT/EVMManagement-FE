import React, { useState, useEffect } from "react";
import { X, Plus, Truck, CheckSquare, Square } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const AddTransportDetailsModal = ({ visible, transport, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [warehouseDetails, setWarehouseDetails] = useState(null);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchWarehouses();
      setSelectedWarehouseId(null);
      setWarehouseDetails(null);
      setSelectedVehicleIds([]);
    }
  }, [visible]);

  const fetchWarehouses = async () => {
    try {
      const response = await axiosInstance.get(endpoints.warehouses.getAll, {
        params: { pageSize: 1000 },
      });
      const allWarehouses = response.data?.items || [];
      // Filter only EVM warehouses
      const evmWarehouses = allWarehouses.filter(
        (warehouse) => warehouse.type === "EVM" || warehouse.type === 0
      );
      console.log("EVM Warehouses:", evmWarehouses);
      setWarehouses(evmWarehouses);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      showError("Không thể tải danh sách kho");
    }
  };

  const fetchWarehouseDetails = async (warehouseId) => {
    setLoadingWarehouse(true);
    try {
      console.log("Fetching warehouse details:", warehouseId);
      const response = await axiosInstance.get(
        endpoints.warehouses.getById(warehouseId)
      );
      console.log("Warehouse details response:", response);

      if (response.data) {
        setWarehouseDetails(response.data);
        const vehicles = response.data.vehicles || [];
        console.log("Total vehicles in warehouse:", vehicles.length);
        console.log("Vehicles:", vehicles);
        
        // Log vehicle statuses
        vehicles.forEach((v, index) => {
          console.log(`Vehicle ${index + 1} status:`, v.status, typeof v.status);
        });
      }
    } catch (error) {
      console.error("Error fetching warehouse details:", error);
      showError("Không thể tải chi tiết kho");
    } finally {
      setLoadingWarehouse(false);
    }
  };

  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value;
    setSelectedWarehouseId(warehouseId);
    setSelectedVehicleIds([]);
    
    if (warehouseId) {
      fetchWarehouseDetails(warehouseId);
    } else {
      setWarehouseDetails(null);
    }
  };

  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedWarehouseId) {
      showError("Vui lòng chọn kho");
      return;
    }

    if (selectedVehicleIds.length === 0) {
      showError("Vui lòng chọn ít nhất một xe");
      return;
    }

    setLoading(true);
    try {
      // Build array of transport details
      const transportDetails = selectedVehicleIds.map((vehicleId) => ({
        transportId: transport.id,
        vehicleId: vehicleId,
      }));

      console.log("Creating transport details:", transportDetails);

      const response = await axiosInstance.post(
        endpoints.transportDetails.create,
        transportDetails
      );

      console.log("Transport details created:", response);
      
      // Auto update transport status to IN_TRANSIT after adding vehicles
      try {
        console.log("Updating transport status to IN_TRANSIT...");
        
        // Build transport update payload with all fields
        const transportUpdateData = {
          providerName: transport.providerName || null,
          pickupLocation: transport.pickupLocation,
          dropoffLocation: transport.dropoffLocation,
          status: "IN_TRANSIT", // Change status to IN_TRANSIT
          scheduledPickupAt: transport.scheduledPickupAt || null,
          deliveredAt: transport.deliveredAt || null,
          orderId: transport.orderId,
        };
        
        console.log("Transport update payload:", transportUpdateData);
        
        await axiosInstance.put(
          endpoints.transports.update(transport.id),
          transportUpdateData
        );
        
        console.log("Transport status updated to IN_TRANSIT");
        showSuccess(
          `Đã thêm ${selectedVehicleIds.length} xe và cập nhật trạng thái vận chuyển!`
        );
      } catch (statusError) {
        console.error("Error updating transport status:", statusError);
        showSuccess(
          `Đã thêm ${selectedVehicleIds.length} xe (nhưng không thể cập nhật trạng thái)`
        );
      }
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating transport details:", error);
      showError(
        error.response?.data?.message || "Không thể thêm xe vào vận chuyển"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedWarehouseId(null);
    setWarehouseDetails(null);
    setSelectedVehicleIds([]);
    onClose();
  };

  if (!visible) return null;

  const vehicles = warehouseDetails?.vehicles || [];
  // Filter vehicles with available statuses (AVAILABLE, IN_STOCK, or status = 0)
  const availableVehicles = vehicles.filter((v) => {
    const normalizedStatus = typeof v.status === 'string' ? v.status.toUpperCase() : v.status;
    return normalizedStatus === 0 || 
           normalizedStatus === "AVAILABLE" || 
           normalizedStatus === "IN_STOCK";
  });
  
  // Debug log
  console.log("Total vehicles:", vehicles.length);
  console.log("Available vehicles after filter:", availableVehicles.length);
  console.log("Available vehicles:", availableVehicles);

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
              <h3 className="text-lg font-semibold text-gray-900">
                Thêm xe vào vận chuyển
              </h3>
              <p className="text-sm text-gray-500">
                Chọn kho EVM và xe để thêm vào transport
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Transport Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">
              Thông tin vận chuyển
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nhà cung cấp:</span>
              <span className="ml-2 font-medium text-gray-900">
                {transport?.providerName || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Dealer:</span>
              <span className="ml-2 font-medium text-gray-900">
                {transport?.dealerName || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Điểm lấy:</span>
              <span className="ml-2 font-medium text-gray-900">
                {transport?.pickupLocation || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Điểm giao:</span>
              <span className="ml-2 font-medium text-gray-900">
                {transport?.dropoffLocation || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warehouse Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn kho EVM <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWarehouseId || ""}
              onChange={handleWarehouseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn kho --</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.address || "N/A"}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          {selectedWarehouseId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn xe (Có sẵn trong kho)
              </label>

              {loadingWarehouse ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    Đang tải danh sách xe...
                  </p>
                </div>
              ) : availableVehicles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Truck size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Không có xe nào có sẵn trong kho này
                  </p>
                </div>
              ) : (
                <>
                  <div className="border border-gray-300 rounded-md max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            <input
                              type="checkbox"
                              checked={
                                selectedVehicleIds.length ===
                                  availableVehicles.length &&
                                availableVehicles.length > 0
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVehicleIds(
                                    availableVehicles.map((v) => v.id)
                                  );
                                } else {
                                  setSelectedVehicleIds([]);
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            VIN
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Model
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Màu sắc
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availableVehicles.map((vehicle) => (
                          <tr
                            key={vehicle.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              selectedVehicleIds.includes(vehicle.id)
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => toggleVehicleSelection(vehicle.id)}
                          >
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedVehicleIds.includes(
                                  vehicle.id
                                )}
                                onChange={() =>
                                  toggleVehicleSelection(vehicle.id)
                                }
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm font-mono font-medium text-gray-900">
                              {vehicle.vin || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {vehicle.variant?.vehicleModel?.name || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {vehicle.variant?.color || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedVehicleIds.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      Đã chọn {selectedVehicleIds.length} xe
                    </p>
                  )}
                </>
              )}
            </div>
          )}

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
              disabled={loading || selectedVehicleIds.length === 0}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Thêm {selectedVehicleIds.length} xe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransportDetailsModal;
