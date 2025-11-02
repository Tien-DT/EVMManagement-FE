import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Car, DollarSign, Percent, FileText, Package, Warehouse } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useAuth } from '../../../hooks/useAuth';

const DealerQuotationDetailForm = ({ details, onChange }) => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseVehicles, setWarehouseVehicles] = useState({}); // { warehouseId: [vehicles] }
  const [variantCache, setVariantCache] = useState({}); // { variantId: variantData }
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [dealerId, setDealerId] = useState(null);

  // Get dealerId from user or localStorage
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Try to get from user object first
        if (user?.dealerId) {
          console.log('✅ DealerId from user object:', user.dealerId);
          setDealerId(user.dealerId);
          return;
        }

        // Try localStorage userProfile
        const userProfileStr = localStorage.getItem('userProfile');
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          if (userProfile?.dealerId) {
            console.log('✅ DealerId from localStorage userProfile:', userProfile.dealerId);
            setDealerId(userProfile.dealerId);
            return;
          }
        }

        // Try localStorage dealerId directly
        const storedDealerId = localStorage.getItem('dealerId');
        if (storedDealerId) {
          console.log('✅ DealerId from localStorage:', storedDealerId);
          setDealerId(storedDealerId);
          return;
        }

        // Last resort: Fetch from API using accountId
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          const accountId = userData.id;
          
          if (accountId) {
            console.log('🔍 Fetching dealerId from API for accountId:', accountId);
            const { dealerService } = await import('../../dealer-manager/services/dealerService');
            const userProfile = await dealerService.getUserProfile(accountId);
            
            if (userProfile.success && userProfile.data?.dealerId) {
              const fetchedDealerId = userProfile.data.dealerId;
              console.log('✅ DealerId fetched from API:', fetchedDealerId);
              
              // Save for future use
              localStorage.setItem('userProfile', JSON.stringify(userProfile.data));
              localStorage.setItem('dealerId', fetchedDealerId);
              
              setDealerId(fetchedDealerId);
              return;
            }
          }
        }

        console.error('❌ Could not find dealerId from any source');
      } catch (error) {
        console.error('❌ Error fetching dealerId:', error);
      }
    };

    fetchDealerId();
  }, [user]);

  // Load dealer warehouses when dealerId is available
  useEffect(() => {
    const loadWarehouses = async () => {
      if (!dealerId) {
        console.log('No dealerId, skipping warehouse fetch');
        return;
      }
      
      setIsLoadingWarehouses(true);
      try {
        console.log('Loading warehouses for dealerId:', dealerId);
        
        const response = await axiosInstance.get(
          endpoints.warehouses.getByDealer(dealerId)
        );
        
        console.log('Warehouses API response:', response);
        
        // Handle response structure like dealer manager does
        const data = response.data?.data || response.data || [];
        const warehousesData = Array.isArray(data) 
          ? data 
          : data.items || data.warehouses || [];
        
        // Filter only DEALER type warehouses
        const dealerWarehouses = warehousesData.filter(w => w.type === 'DEALER');
        
        setWarehouses(dealerWarehouses);
        console.log('✅ Loaded dealer warehouses:', dealerWarehouses);
      } catch (error) {
        console.error('❌ Error loading warehouses:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, [dealerId]);

  // Load vehicles when warehouse is selected
  const loadWarehouseVehicles = async (warehouseId) => {
    if (warehouseVehicles[warehouseId]) {
      return; // Already loaded
    }

    try {
      const response = await axiosInstance.get(
        endpoints.warehouses.getById(warehouseId)
      );
      const warehouse = response.data?.data || response.data || {};
      const vehicles = warehouse.vehicles || [];
      
      setWarehouseVehicles(prev => ({
        ...prev,
        [warehouseId]: vehicles
      }));
      
      console.log(`Loaded vehicles for warehouse ${warehouseId}:`, vehicles);
    } catch (error) {
      console.error('Error loading warehouse vehicles:', error);
    }
  };

  // Load variant details
  const loadVariantDetails = async (variantId) => {
    if (variantCache[variantId]) {
      return variantCache[variantId];
    }

    try {
      const response = await axiosInstance.get(
        endpoints.vehicleVariants.getById(variantId)
      );
      const variant = response.data?.data || response.data || {};
      
      setVariantCache(prev => ({
        ...prev,
        [variantId]: variant
      }));
      
      console.log('Loaded variant:', variant);
      return variant;
    } catch (error) {
      console.error('Error loading variant:', error);
      return null;
    }
  };

  const handleAddDetail = () => {
    onChange([
      ...details,
      {
        warehouseId: '',
        vehicleId: '',
        vehicleVariantId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        note: '',
      }
    ]);
  };

  const handleRemoveDetail = (index) => {
    onChange(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = async (index, field, value) => {
    const updatedDetails = [...details];
    const detail = { ...updatedDetails[index] };
    
    if (field === 'warehouseId') {
      // When warehouse changes, reset vehicle selection and load vehicles
      detail.warehouseId = value;
      detail.vehicleId = '';
      detail.vehicleVariantId = '';
      detail.unitPrice = 0;
      
      if (value) {
        await loadWarehouseVehicles(value);
      }
    } else if (field === 'vehicleId') {
      // When vehicle is selected, load variant info
      const vehicles = warehouseVehicles[detail.warehouseId] || [];
      const selectedVehicle = vehicles.find(v => v.id === value);
      
      if (selectedVehicle) {
        detail.vehicleId = value;
        detail.vehicleVariantId = selectedVehicle.variantId;
        
        // Load variant details to get price
        const variant = await loadVariantDetails(selectedVehicle.variantId);
        if (variant) {
          detail.unitPrice = variant.price || 0;
        }
        
        // Check if this variant already exists in other details
        const existingDetailIndex = updatedDetails.findIndex((d, i) => 
          i !== index && d.vehicleVariantId === selectedVehicle.variantId
        );
        
        if (existingDetailIndex !== -1) {
          // Increment quantity of existing detail and remove this one
          updatedDetails[existingDetailIndex].quantity += 1;
          updatedDetails.splice(index, 1);
          onChange(updatedDetails);
          return;
        }
      }
    } else {
      detail[field] = value;
    }
    
    updatedDetails[index] = detail;
    onChange(updatedDetails);
  };

  const calculateLineTotal = (detail) => {
    const subtotal = detail.quantity * detail.unitPrice;
    const discount = subtotal * (detail.discountPercent / 100);
    return subtotal - discount;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const grandTotal = details.reduce((sum, detail) => sum + calculateLineTotal(detail), 0);

  // Get variant display info
  const getVariantDisplayInfo = (variantId) => {
    const variant = variantCache[variantId];
    if (!variant) return null;
    
    const specs = [
      variant.color,
      variant.engine,
      variant.batteryType
    ].filter(Boolean).join(' - ');
    
    return {
      modelName: variant.modelName || 'Unknown Model',
      specs: specs || 'N/A'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          Chi tiết báo giá
        </h3>
        <button
          type="button"
          onClick={handleAddDetail}
          disabled={isLoadingWarehouses}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Thêm xe
        </button>
      </div>

      {isLoadingWarehouses ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải kho...</p>
        </div>
      ) : details.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <div className="inline-flex p-6 bg-gray-200 rounded-full mb-4">
            <Package size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4 font-medium">Chưa có chi tiết báo giá</p>
          <button
            type="button"
            onClick={handleAddDetail}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-bold"
          >
            + Thêm xe đầu tiên
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {details.map((detail, index) => {
              const variantInfo = detail.vehicleVariantId ? getVariantDisplayInfo(detail.vehicleVariantId) : null;
              const selectedWarehouse = warehouses.find(w => w.id === detail.warehouseId);
              const vehicles = warehouseVehicles[detail.warehouseId] || [];

              return (
                <div 
                  key={index} 
                  className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">Xe #{index + 1}</span>
                    </div>
                    {details.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDetail(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 transform hover:scale-110"
                        title="Xóa dòng"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Warehouse Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Warehouse size={16} className="text-blue-600" />
                        Chọn kho <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={detail.warehouseId}
                        onChange={(e) => handleDetailChange(index, 'warehouseId', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                        required
                      >
                        <option value="">-- Chọn kho --</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.vehicles?.length || 0} xe)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vehicle Selection */}
                    {detail.warehouseId && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Car size={16} className="text-emerald-600" />
                          Chọn xe <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={detail.vehicleId}
                          onChange={(e) => handleDetailChange(index, 'vehicleId', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all"
                          required
                        >
                          <option value="">-- Chọn xe --</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.vin || vehicle.id.slice(0, 8)} - {vehicle.status || 'N/A'}
                            </option>
                          ))}
                        </select>
                        {vehicles.length === 0 && (
                          <p className="mt-2 text-sm text-orange-600">
                            Kho này chưa có xe. Vui lòng chọn kho khác.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Variant Info Display */}
                    {variantInfo && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Thông tin phiên bản
                        </label>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3">
                          <div className="font-bold text-blue-900 text-lg">{variantInfo.modelName}</div>
                          <div className="text-sm text-blue-700 mt-1">{variantInfo.specs}</div>
                          <div className="text-xs text-blue-600 mt-2 font-mono">
                            Variant ID: {detail.vehicleVariantId}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Package size={16} className="text-emerald-600" />
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={detail.quantity}
                        onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-center transition-all"
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign size={16} className="text-green-600" />
                        Đơn giá (VND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={detail.unitPrice}
                        onChange={(e) => handleDetailChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold transition-all"
                        required
                      />
                    </div>

                    {/* Discount % */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Percent size={16} className="text-orange-600" />
                        Giảm giá (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={detail.discountPercent}
                        onChange={(e) => handleDetailChange(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-bold text-center transition-all"
                      />
                    </div>

                    {/* Line Total */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-600" />
                        Thành tiền
                      </label>
                      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl font-black text-emerald-700 text-lg flex items-center justify-center">
                        {formatCurrency(calculateLineTotal(detail))}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-purple-600" />
                        Ghi chú
                      </label>
                      <input
                        type="text"
                        value={detail.note || ''}
                        onChange={(e) => handleDetailChange(index, 'note', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Ghi chú cho xe này..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Total */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign size={28} className="text-white" />
                </div>
                <span className="text-2xl font-black text-white">Tổng cộng:</span>
              </div>
              <span className="text-3xl font-black text-white drop-shadow-lg">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-blue-600 mb-1">Số xe</p>
              <p className="text-2xl font-bold text-blue-900">{details.length}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-purple-600 mb-1">Tổng số lượng</p>
              <p className="text-2xl font-bold text-purple-900">
                {details.reduce((sum, d) => sum + (d.quantity || 0), 0)}
              </p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-orange-600 mb-1">Giảm giá TB</p>
              <p className="text-2xl font-bold text-orange-900">
                {details.length > 0 
                  ? (details.reduce((sum, d) => sum + (d.discountPercent || 0), 0) / details.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DealerQuotationDetailForm;
