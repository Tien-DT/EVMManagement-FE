import React from 'react';
import { Trash2, Plus } from 'lucide-react';

const QuotationDetailForm = ({ details, onChange }) => {
  const handleAddDetail = () => {
    onChange([
      ...details,
      {
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

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = details.map((detail, i) => {
      if (i === index) {
        const updated = { ...detail, [field]: value };
        return updated;
      }
      return detail;
    });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Chi tiết báo giá</h3>
        <button
          type="button"
          onClick={handleAddDetail}
          className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" />
          Thêm dòng
        </button>
      </div>

      {details.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-2">Chưa có chi tiết báo giá</p>
          <button
            type="button"
            onClick={handleAddDetail}
            className="text-emerald-600 hover:text-emerald-700 text-sm"
          >
            Thêm dòng đầu tiên
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-gray-900">Dòng {index + 1}</span>
                  {details.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                      className="text-red-600 hover:text-red-700"
                      title="Xóa dòng"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Phiên bản xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={detail.vehicleVariantId}
                      onChange={(e) => handleDetailChange(index, 'vehicleVariantId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="UUID của phiên bản xe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={detail.quantity}
                      onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn giá (VND)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={detail.unitPrice}
                      onChange={(e) => handleDetailChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giảm giá (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={detail.discountPercent}
                      onChange={(e) => handleDetailChange(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành tiền
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium text-emerald-600">
                      {formatCurrency(calculateLineTotal(detail))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={detail.note}
                      onChange={(e) => handleDetailChange(index, 'note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Ghi chú cho dòng này..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuotationDetailForm;

