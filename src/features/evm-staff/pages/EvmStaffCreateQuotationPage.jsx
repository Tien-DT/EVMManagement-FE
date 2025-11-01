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
import { useCreateQuotation } from '../hooks/useCreateQuotation';
import QuotationDetailForm from '../components/QuotationDetailForm';
import { useAuth } from '../../../hooks/useAuth';
import orderService from '../services/orderService';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const EvmStaffCreateQuotationPage = () => {
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
              vehicleId: detail.vehicleId, // null for variant-only
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
        
        console.log('Grouped quotation details:', quotationDetailsWithPrices);
        
        // Pre-fill form with order info
        setFormData(prev => ({
          ...prev,
          code: quotationCode,
          customerId: order.customerId || null, // B2B orders have null customerId
          dealerId: order.dealerId,
          orderId: order.id, // Link quotation to order
          quotationDetails: quotationDetailsWithPrices
        }));
        
      } catch (error) {
        console.error('Error loading B2B order:', error);
        showError('Không thể tải thông tin đơn hàng B2B');
      } finally {
        setIsLoadingOrder(false);
      }
    };
    
    loadB2BOrder();
  }, [orderId, showError]);

  // Load order request (existing flow)
  useEffect(() => {
    if (!requestId) return;
    // TODO: Fetch order request details from API using requestId, then setOrderRequest(response)
    setOrderRequest(null);
  }, [requestId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailsChange = (details) => {
    setFormData(prev => ({ ...prev, quotationDetails: details }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - customerId only required for non-B2B orders
    if (!formData.code || (!b2bOrder && !formData.customerId)) {
      showError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.quotationDetails.length === 0) {
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
        
        // If creating quotation for B2B order, update order status to QUOTATION_RECEIVED
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
        
        navigate('/evm-staff/orders');
      } else {
        showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      showError(isEditMode ? 'Có lỗi xảy ra khi cập nhật báo giá' : 'Có lỗi xảy ra khi tạo báo giá');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (isSubmitting || isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          {isLoadingOrder ? 'Đang tải thông tin đơn hàng...' : 'Đang xử lý...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8 animate-fadeIn">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-slideIn">
          <button
            onClick={() => navigate('/evm-staff/quotations')}
            className="p-3 text-gray-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isEditMode ? 'Chỉnh Sửa Báo Giá' : 'Tạo Báo Giá Mới'}
            </h1>
            <p className="text-gray-600 mt-2">Nhập thông tin chi tiết để {isEditMode ? 'cập nhật' : 'tạo'} báo giá</p>
          </div>
        </div>

        {/* B2B Order Info - Show when creating from B2B order */}
        {b2bOrder && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              Thông tin đơn hàng B2B
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                <User size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Dealer</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {b2bOrder.dealer?.name || b2bOrder.dealerName || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                <FileText size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Mã đơn</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{b2bOrder.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                <Package size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Số lượng xe</p>
                  <p className="text-sm font-semibold text-gray-900">{b2bOrder.orderDetails?.length || 0} xe</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                <Calendar size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ngày đặt</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {b2bOrder.createdDate ? new Date(b2bOrder.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Đây là đơn hàng B2B (Dealer đặt xe từ hãng). Sau khi tạo báo giá, 
                đơn hàng sẽ chuyển sang trạng thái "Chờ Dealer chấp nhận".
              </p>
            </div>
          </div>
        )}

        {/* Order Request Info - Show only if creating from request */}
        {orderRequest && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              Thông tin yêu cầu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <User size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Đại lý</p>
                  <p className="text-sm font-semibold text-gray-900">{orderRequest.dealerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Car size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Xe</p>
                  <p className="text-sm font-semibold text-gray-900">{orderRequest.vehicleModel} - {orderRequest.vehicleVariant}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Calculator size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Số lượng</p>
                  <p className="text-sm font-semibold text-gray-900">{orderRequest.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Calendar size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ngày yêu cầu</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(orderRequest.requestedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quotation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 animate-scaleIn">
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

              {/* Only show customerId field if NOT a B2B order */}
              {!b2bOrder && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ID Khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                    placeholder="UUID của khách hàng"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Có hiệu lực đến <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold transition-all"
                >
                  <option value="DRAFT">📝 Bản nháp</option>
                  <option value="SENT">📤 Đã gửi</option>
                  <option value="APPROVED">✅ Đã duyệt</option>
                  <option value="REJECTED">❌ Bị từ chối</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quotation Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 animate-scaleIn">
            <QuotationDetailForm 
              details={formData.quotationDetails} 
              onChange={handleDetailsChange} 
            />
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 animate-scaleIn">
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
                placeholder="Ghi chú thêm về báo giá, điều khoản đặc biệt..."
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg animate-slideIn">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Lưu ý khi tạo báo giá:</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Kiểm tra kỹ thông tin khách hàng và phiên bản xe trước khi tạo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Đảm bảo giá và chiết khấu được tính toán chính xác</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Ngày hiệu lực nên đủ thời gian để khách hàng xem xét</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Ghi chú rõ ràng các điều khoản và điều kiện áp dụng</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 animate-slideIn">
            <button
              type="button"
              onClick={() => navigate('/evm-staff/quotations')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditMode ? 'Cập nhật báo giá' : 'Tạo báo giá'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvmStaffCreateQuotationPage;
