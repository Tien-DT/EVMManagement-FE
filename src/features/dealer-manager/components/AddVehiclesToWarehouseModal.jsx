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
  const [transports, setTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [vinInputs, setVinInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load completed transports
  useEffect(() => {
    if (isOpen && dealerId) {
      loadTransports();
    }
  }, [isOpen, dealerId]);

  const loadTransports = async () => {
    setLoading(true);
    try {
      console.log('Loading completed transports for dealerId:', dealerId);
      
      // Load transports by dealer
      const response = await axiosInstance.get(endpoints.transports.getByDealer(dealerId), {
        params: {
          pageNumber: 1,
          pageSize: 100,
        }
      });
      
      console.log('Transports API response:', response);
      
      // Extract transports from response
      let transportsList = [];
      if (response.data?.items) {
        transportsList = response.data.items;
      } else if (response.data?.data?.items) {
        transportsList = response.data.data.items;
      } else if (Array.isArray(response.data?.data)) {
        transportsList = response.data.data;
      } else if (Array.isArray(response.data)) {
        transportsList = response.data;
      }
      
      console.log('Extracted transports list:', transportsList);
      
      // Filter transports with COMPLETED status
      const completedTransports = transportsList.filter(transport => {
        const isCompleted = transport.status?.toUpperCase() === 'COMPLETED';
        console.log(`Transport ${transport.id}: status=${transport.status}, isCompleted=${isCompleted}`);
        return isCompleted;
      });
      
      console.log('Filtered COMPLETED transports:', completedTransports);
      
      if (completedTransports.length === 0) {
        console.warn('No COMPLETED transports found. Total transports loaded:', transportsList.length);
      }
      
      setTransports(completedTransports);
      
    } catch (error) {
      console.error('Error loading transports:', error);
      console.error('Error details:', error.response?.data);
      alert('Không thể tải danh sách vận chuyển: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Load transport details and extract vehicles
  const handleTransportSelect = async (transportId) => {
    if (!transportId) {
      setSelectedTransport(null);
      setVehicles([]);
      setSelectedVehicles([]);
      setVinInputs({});
      return;
    }

    setLoading(true);
    try {
      console.log('Loading transport details for transportId:', transportId);
      
      // Load transport details
      const response = await axiosInstance.get(endpoints.transports.getById(transportId));
      
      console.log('Transport API response:', response);
      
      // Handle response structure - could be response.data or response.data.data
      let transport = response.data?.data || response.data;
      
      console.log('Transport details:', transport);
      
      setSelectedTransport(transport);
      
      // Extract vehicles from transportDetails
      console.log('Checking transportDetails:', transport.transportDetails);
      console.log('transportDetails length:', transport.transportDetails?.length);
      
      if (transport.transportDetails && transport.transportDetails.length > 0) {
        const vehiclesList = transport.transportDetails
          .filter(detail => detail.vehicleId || detail.vehicleVariantId)
          .map((detail, index) => {
            const variantId = detail.vehicleVariantId;
            const variantName = detail.vehicleVariantName || detail.vehicleVariant?.name;
            const vehicleVin = detail.vehicleVin || detail.vin;
            
            console.log('Processing transport detail:', {
              detailId: detail.id,
              vehicleId: detail.vehicleId,
              variantId: variantId,
              variantName: variantName,
              vin: vehicleVin
            });
            
            return {
              id: `${detail.id}-${index}`,
              transportDetailId: detail.id,
              vehicleId: detail.vehicleId,
              variantId: variantId,
              variantName: variantName,
              vin: vehicleVin,
              modelName: variantName || 'Unknown Model',
              color: 'N/A', // Transport details may not have color
              price: 0, // Transport details may not have price
              imageUrl: '',
            };
          });
        
        console.log('Extracted vehicles:', vehiclesList);
        
        if (vehiclesList.length > 0) {
          setVehicles(vehiclesList);
          
          // Auto-select all vehicles by default
          const allVehicleIds = vehiclesList.map(v => v.id);
          setSelectedVehicles(allVehicleIds);
        } else {
          setVehicles([]);
          alert('Không tìm thấy thông tin xe trong lô vận chuyển này');
        }
      } else {
        console.warn('No transportDetails found in transport:', transport);
        setVehicles([]);
        alert('Lô vận chuyển này không có xe nào');
      }
      
    } catch (error) {
      console.error('Error loading transport details:', error);
      alert('Không thể tải chi tiết vận chuyển');
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
    if (!selectedTransport?.id) {
      alert('Vui lòng chọn lô vận chuyển');
      return;
    }

    if (selectedVehicles.length === 0) {
      alert('Không có xe nào để thêm vào kho');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Adding vehicles to warehouse using simplified API...');
      
      const payload = {
        transportId: selectedTransport.id,
        warehouseId: warehouseId
      };

      console.log('Payload:', payload);

      // Call new simplified API endpoint
      const response = await axiosInstance.post(
        endpoints.transports.addToWarehouse,
        payload
      );

      console.log('Response:', response);

      alert(`Đã thêm ${selectedVehicles.length} xe vào kho thành công!`);
      
      // Reset and close
      setSelectedTransport(null);
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
              <p className="text-sm text-blue-100">Chọn lô vận chuyển và xe để thêm vào kho</p>
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
          {/* Transport Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chọn lô vận chuyển (Đã hoàn thành) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTransport?.id || ''}
              onChange={(e) => handleTransportSelect(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
              disabled={loading}
            >
              <option value="">-- Chọn lô vận chuyển --</option>
              {transports.map(transport => (
                <option key={transport.id} value={transport.id}>
                  {transport.orderCode || 'N/A'} - {transport.providerName || 'N/A'} ({transport.transportDetails?.length || 0} xe)
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
                  Danh sách xe ({vehicles.length} xe sẽ được thêm vào kho)
                </label>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className="border-2 border-green-500 bg-green-50 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkmark Icon */}
                      <div className="mt-1">
                        <CheckSquare size={24} className="text-green-600" />
                      </div>

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
                        {vehicle.vin && (
                          <p className="text-sm text-gray-600 mt-1">VIN: {vehicle.vin}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedTransport && vehicles.length === 0 && !loading && (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Lô vận chuyển này không có xe nào</p>
            </div>
          )}

          {/* Info */}
          {selectedVehicles.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Tất cả xe trong lô vận chuyển sẽ được thêm vào kho:</p>
                  <ul className="space-y-1">
                    <li>• Số lượng: <strong>{selectedVehicles.length} xe</strong></li>
                    <li>• Tất cả xe sẽ được thêm vào kho đã chọn</li>
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
