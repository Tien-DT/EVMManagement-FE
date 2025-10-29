// src/features/dealer-manager/components/PaymentModal.jsx
import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import { useNotification } from '../../../context/NotificationContext';

const PaymentModal = ({ 
  visible, 
  onClose, 
  orderId, 
  amount, 
  isDeposit = true,
  note = '' 
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const { isProcessing, createPayment, payDeposit, payRemaining } = usePayment();
  const { showSuccess, showError } = useNotification();

  if (!visible) return null;

  const handleConfirmPayment = async () => {
    setConfirmed(true);
    
    try {
      const paymentData = {
        orderId,
        amount,
        note,
        isDeposit,
      };

      if (isDeposit) {
        await payDeposit(paymentData);
      } else {
        await payRemaining(paymentData);
      }
      
      showSuccess('Đang chuyển hướng đến trang thanh toán VNPAY...');
    } catch (error) {
      setConfirmed(false);
      showError('Không thể tạo thanh toán. Vui lòng thử lại.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isDeposit ? 'Thanh toán tiền cọc' : 'Thanh toán số tiền còn lại'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
            <p className="font-medium text-gray-900">
              {orderId ? orderId.slice(-12) : 'N/A'}
            </p>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {isDeposit ? 'Tiền cọc' : 'Số tiền còn lại'}
              </p>
              <p className="text-2xl font-bold text-teal-600">
                {formatCurrency(amount)}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">
                Lưu ý quan trọng
              </p>
              <p className="text-sm text-yellow-800">
                Bạn sẽ được chuyển đến trang thanh toán VNPAY. 
                Vui lòng hoàn tất thanh toán để đơn hàng được xử lý.
              </p>
            </div>
          </div>

          {/* Note */}
          {note && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900">{note}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing || confirmed}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing || confirmed}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing || confirmed ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>Xác nhận thanh toán</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

