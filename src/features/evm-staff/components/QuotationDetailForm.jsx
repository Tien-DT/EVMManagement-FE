import React from 'react';
import { Trash2, Plus, Car, DollarSign, Percent, FileText, Package } from 'lucide-react';

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
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={18} />
          Thêm dòng
        </button>
      </div>

      {details.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 animate-pulse">
          <div className="inline-flex p-6 bg-gray-200 rounded-full mb-4">
            <Package size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4 font-medium">Chưa có chi tiết báo giá</p>
          <button
            type="button"
            onClick={handleAddDetail}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-bold"
          >
            + Thêm dòng đầu tiên
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div 
                key={index} 
                className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all duration-300 animate-scaleIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Dòng {index + 1}</span>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Car size={16} className="text-blue-600" />
                      ID Phiên bản xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={detail.vehicleVariantId}
                      onChange={(e) => handleDetailChange(index, 'vehicleVariantId', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all"
                      placeholder="UUID của phiên bản xe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Package size={16} className="text-emerald-600" />
                      Số lượng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={detail.quantity}
                      onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-center transition-all"
                      required
                    />
                  </div>

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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Percent size={16} className="text-orange-600" />
                      Giảm giá (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={detail.discountPercent}
                      onChange={(e) => handleDetailChange(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-bold text-center transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-600" />
                      Thành tiền
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl font-black text-emerald-700 text-lg flex items-center justify-center">
                      {formatCurrency(calculateLineTotal(detail))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText size={16} className="text-purple-600" />
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={detail.note}
                      onChange={(e) => handleDetailChange(index, 'note', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Ghi chú cho dòng này..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-2xl animate-pulse">
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
              <p className="text-sm font-medium text-blue-600 mb-1">Số dòng</p>
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

export default QuotationDetailForm;
