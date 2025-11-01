// src/features/dealer-staff/pages/CreateQuotationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Send,
  Car,
  User,
  Calculator,
  FileText,
  AlertCircle,
  Calendar,
  Package
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { useCreateQuotation } from '../../evm-staff/hooks/useCreateQuotation';
import QuotationDetailForm from '../../evm-staff/components/QuotationDetailForm';
import { useAuth } from '../../../hooks/useAuth';
import orderService from '../../evm-staff/services/orderService';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const { requestId, id } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const autoAccept = searchParams.get('autoAccept') === 'true'; // Check if auto-accept flag is set
  const { showSuccess, showError } = useNotification();
  const { createQuotation, updateQuotation, isSubmitting } = useCreateQuotation();
  const { user } = useAuth();
  
  const [orderRequest, setOrderRequest] = useState(null);
  const [b2bOrder, setB2bOrder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  
  // Form data theo format API
  const [formData, setFormData] = useState({
    code: '',
    customerId: null, // null by default for B2B orders
    createdByUserId: user?.id || '',
    note: '',
    status: 'SENT', // Default status is SENT for B2B quotations
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 ngày sau
    quotationDetails: [
      {
        vehicleVariantId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        note: '',
      }
    ]
  });

  // Set user ID when user is loaded
  useEffect(() => {
    if (user?.id) {
      console.log('Setting createdByUserId from user:', user);
      setFormData(prev => ({ ...prev, createdByUserId: user.id }));
    }
  }, [user]);

  // Load B2B order if orderId is provided (from B2B order flow)
  useEffect(() => {
    const loadB2BOrder = async () => {
      if (!orderId) return;
      
      setIsLoadingOrder(true);
      try {
        console.log('Loading B2B order:', orderId);
        const response = await orderService.getOrderByIdWithDetails(orderId);
        console.log('B2B order loaded:', response);
        
        const order = response.data;
        setB2bOrder(order);
        
        // Auto-generate code for quotation
        const quotationCode = `BG-${Date.now().toString().slice(-8)}`;
        
        // Group orderDetails by vehicleVariantId and sum quantities
        const groupedDetails = {};
        order.orderDetails?.forEach(detail => {
          const variantId = detail.vehicleVariantId;
          if (!groupedDetails[variantId]) {
            groupedDetails[variantId] = {
              vehicleVariantId: variantId,
              vehicleId: detail.vehicleId,
              quantity: 0,
              discountPercent: detail.discountPercent || 0,
              note: detail.note || '',
            };
          }
          groupedDetails[variantId].quantity += (detail.quantity || 1);
        });
        
        // Load prices and details from VehicleVariants for each unique variant
        const quotationDetailsWithPrices = await Promise.all(
          Object.values(groupedDetails).map(async (detail) => {
            let unitPrice = 0;
            let vehicleModelName = 'Unknown Model';
            let variantInfo = '';
            
            // Fetch variant to get price and details
            try {
              const variantResponse = await axiosInstance.get(
                endpoints.vehicleVariants.getById(detail.vehicleVariantId)
              );
              const variant = variantResponse.data;
              unitPrice = variant?.price || 0;
              
              // Build variant info string
              variantInfo = [
                variant?.color,
                variant?.engine,
                variant?.batteryType
              ].filter(Boolean).join(' - ');
              
              console.log(`Loaded variant ${detail.vehicleVariantId}:`, variant);
              
              // Fetch vehicle model if modelId exists
              if (variant?.modelId) {
                try {
                  const modelResponse = await axiosInstance.get(
                    endpoints.vehicleModels.getById(variant.modelId)
                  );
                  vehicleModelName = modelResponse.data?.name || 'Unknown Model';
                  console.log(`Loaded model name:`, vehicleModelName);
                } catch (modelError) {
                  console.error('Error loading vehicle model:', modelError);
                }
              }
            } catch (error) {
              console.error('Error loading variant price:', error);
            }
            
            return {
              vehicleVariantId: detail.vehicleVariantId,
              vehicleId: detail.vehicleId,
              quantity: detail.quantity,
              unitPrice: unitPrice,
              discountPercent: detail.discountPercent,
              note: detail.note,
              // Additional info for display
              vehicleModelName: vehicleModelName,
              variantInfo: variantInfo,
            };
          })
        );
        
        setFormData(prev => ({
          ...prev,
          code: quotationCode,
          customerId: order.customerId,
          quotationDetails: quotationDetailsWithPrices
        }));
        
        console.log('Quotation details with prices:', quotationDetailsWithPrices);
        
      } catch (error) {
        console.error('Error loading B2B order:', error);
        showError('Không thể tải thông tin đơn hàng');
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadB2BOrder();
  }, [orderId, showError]);

  // Handler for quotation details changes
  const handleDetailsChange = (details) => {
    setFormData(prev => ({ ...prev, quotationDetails: details }));
  };

  // Handler for input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status) => {
    // Validate form
    if (!formData.code) {
      showError('Vui lòng nhập mã báo giá');
      return;
    }

    if (!formData.quotationDetails || formData.quotationDetails.length === 0) {
      showError('Vui lòng thêm ít nhất một chi tiết báo giá');
      return;
    }

    try {
      let result;
      
      // Get correct user ID - could be userProfileId, id, or userId
      const userId = user?.userProfileId || user?.id || user?.userId;
      
      // Validate createdByUserId
      if (!userId) {
        showError('Không xác định được user ID. Vui lòng đăng nhập lại.');
        console.error('User object:', user);
        return;
      }
      
      // Clean quotation details - remove UI-only fields and extra fields not in DTO
      const cleanedData = {
        code: formData.code,
        customerId: formData.customerId || null, // Ensure null for B2B orders
        createdByUserId: userId, // Use correct user profile ID
        note: formData.note || '',
        status: formData.status,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        quotationDetails: formData.quotationDetails.map(detail => ({
          vehicleVariantId: detail.vehicleVariantId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          discountPercent: detail.discountPercent,
          note: detail.note || '',
        }))
      };
      
      console.log('Current user:', user);
      console.log('Using userId:', userId);
      console.log('Cleaned quotation data:', cleanedData);
      
      if (isEditMode) {
        result = await updateQuotation(id, cleanedData);
      } else {
        result = await createQuotation(cleanedData);
      }
      
      console.log('Quotation creation result:', result);
      
      if (result.success) {
        showSuccess(isEditMode ? 'Cập nhật báo giá thành công!' : 'Tạo báo giá thành công!');
        
        // If creating quotation for B2B order, update order status
        console.log('Checking B2B order update - orderId:', orderId, 'result.data:', result.data);
        
        if (orderId && result.data?.id && b2bOrder) {
          try {
            console.log('Updating B2B order status after quotation creation...');
            console.log('Order ID:', orderId);
            console.log('Quotation ID:', result.data.id);
            console.log('Current B2B Order:', b2bOrder);
            
            // Build update request with all non-null fields
            // If autoAccept flag is set (from AWAITING_CONFIRM), update directly to QUOTATION_ACCEPTED
            const newStatus = autoAccept ? 'QUOTATION_ACCEPTED' : 'QUOTATION_RECEIVED';
            
            const orderUpdateData = {
              code: b2bOrder.code,
              dealerId: b2bOrder.dealerId,
              status: newStatus, // Update status based on autoAccept flag
              quotationId: result.data.id, // Link quotation
              orderType: b2bOrder.orderType,
            };
            
            // Add optional fields if they exist
            if (b2bOrder.customerId) orderUpdateData.customerId = b2bOrder.customerId;
            if (b2bOrder.handoverRecordId) orderUpdateData.handoverRecordId = b2bOrder.handoverRecordId;
            if (b2bOrder.contractId) orderUpdateData.contractId = b2bOrder.contractId;
            if (b2bOrder.depositId) orderUpdateData.depositId = b2bOrder.depositId;
            if (b2bOrder.note) orderUpdateData.note = b2bOrder.note;
            if (b2bOrder.totalAmount) orderUpdateData.totalAmount = b2bOrder.totalAmount;
            if (b2bOrder.discount) orderUpdateData.discount = b2bOrder.discount;
            if (b2bOrder.finalAmount) orderUpdateData.finalAmount = b2bOrder.finalAmount;
            if (b2bOrder.handoverDate) orderUpdateData.handoverDate = b2bOrder.handoverDate;
            if (b2bOrder.expectedDeliveryAt) orderUpdateData.expectedDeliveryAt = b2bOrder.expectedDeliveryAt;
            
            console.log('Order update payload:', orderUpdateData);
            
            // Update order using PUT endpoint
            const orderUpdateResponse = await axiosInstance.put(
              endpoints.orders.update(orderId),
              orderUpdateData
            );
            
            console.log('Order update response:', orderUpdateResponse);
            console.log(`B2B order status updated to ${newStatus} successfully`);
            
            if (autoAccept) {
              showSuccess('Đã tạo báo giá thành công! Đơn hàng chuyển sang trạng thái "Báo giá được chấp nhận"');
            } else {
              showSuccess('Đã gửi báo giá thành công! Đơn hàng chuyển sang trạng thái "Đã gửi báo giá"');
            }
          } catch (orderUpdateError) {
            console.error('Error updating order status:', orderUpdateError);
            console.error('Error details:', orderUpdateError.response?.data);
            showError('Báo giá đã tạo nhưng không thể cập nhật trạng thái đơn hàng: ' + (orderUpdateError.response?.data?.message || orderUpdateError.message));
          }
        } else {
          console.log('Skipping order update - orderId:', orderId, 'resultData:', result.data, 'b2bOrder:', b2bOrder);
        }
        
        // Navigate back to dealer-staff orders page
        navigate('/dealer-staff/orders');
      } else {
        showError(result.message || 'Tạo báo giá thất bại');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      showError(error.message || 'Có lỗi xảy ra');
    }
  };

  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dealer-staff/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa báo giá' : 'Tạo báo giá mới'}
            </h1>
            <p className="text-gray-600 mt-1">
              {orderId ? `Cho đơn hàng #${b2bOrder?.code || orderId.slice(0, 8)}` : 'Tạo báo giá cho khách hàng'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('SENT')}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Tạo và gửi báo giá</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Order Info (if from order) */}
      {b2bOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Mã đơn hàng:</span>
                  <span className="ml-2 font-medium text-blue-900">{b2bOrder.code}</span>
                </div>
                <div>
                  <span className="text-blue-700">Dealer:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {b2bOrder.dealerName || b2bOrder.dealer?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Form Fields */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={b2bOrder ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mã báo giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
              placeholder="VD: BG001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hiệu lực đến
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Quotation Details Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
        <QuotationDetailForm
          details={formData.quotationDetails || []}
          onChange={handleDetailsChange}
        />
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          Thông tin bổ sung
        </h3>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            placeholder="Ghi chú thêm về báo giá..."
          />
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationPage;