// src/features/evm-staff/components/HandoverRecordForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handoverRecordSchema, handoverRecordUpdateSchema } from '../schemas/handoverRecordSchema';
import {
  Package,
  Car,
  Truck,
  Calendar,
  FileText,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const HandoverRecordForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  loading = false,
  isEdit = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(isEdit ? handoverRecordUpdateSchema : handoverRecordSchema),
    defaultValues: initialData || {
      orderId: '',
      vehicleId: '',
      transportDetailId: '',
      handoverDate: '',
      notes: '',
      isAccepted: false
    }
  });

  const onFormSubmit = (data) => {
    // Clean up empty strings to null for backend
    const cleanedData = {
      ...data,
      transportDetailId: data.transportDetailId || null,
      handoverDate: data.handoverDate || null,
      notes: data.notes || null,
    };
    
    console.log('Form submitting cleaned data:', cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
            <Truck className="text-white" size={20} />
          </div>
          {isEdit ? 'Cập nhật Bàn Giao' : 'Thông Tin Bàn Giao'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order ID - Only for create */}
          {!isEdit && (
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Package size={16} className="mr-2 text-emerald-600" />
                ID Đơn Hàng
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                {...register('orderId')}
                type="text"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.orderId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                }`}
                placeholder="Nhập ID đơn hàng (GUID)"
              />
              {errors.orderId && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.orderId.message}
                </p>
              )}
            </div>
          )}

          {/* Vehicle ID - Only for create */}
          {!isEdit && (
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Car size={16} className="mr-2 text-emerald-600" />
                ID Xe
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                {...register('vehicleId')}
                type="text"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.vehicleId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                }`}
                placeholder="Nhập ID xe (GUID)"
              />
              {errors.vehicleId && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.vehicleId.message}
                </p>
              )}
            </div>
          )}

          {/* Transport Detail ID - Optional */}
          <div className={!isEdit ? 'md:col-span-2' : ''}>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Truck size={16} className="mr-2 text-emerald-600" />
              ID Thông Tin Vận Chuyển
              <span className="text-gray-400 ml-2 text-xs">(Tùy chọn)</span>
            </label>
            <input
              {...register('transportDetailId')}
              type="text"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.transportDetailId
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
              }`}
              placeholder="Nhập ID thông tin vận chuyển (GUID) hoặc để trống"
            />
            {errors.transportDetailId && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.transportDetailId.message}
              </p>
            )}
          </div>

          {/* Handover Date - Optional */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="mr-2 text-emerald-600" />
              Ngày Bàn Giao
              <span className="text-gray-400 ml-2 text-xs">(Tùy chọn)</span>
            </label>
            <input
              {...register('handoverDate')}
              type="datetime-local"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.handoverDate
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
              }`}
            />
            {errors.handoverDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.handoverDate.message}
              </p>
            )}
          </div>

          {/* Is Accepted - Only for edit */}
          {isEdit && (
            <div className="flex items-center">
              <input
                {...register('isAccepted')}
                type="checkbox"
                id="isAccepted"
                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 transition-all"
              />
              <label htmlFor="isAccepted" className="ml-3 flex items-center text-sm font-semibold text-gray-700">
                <CheckCircle size={16} className="mr-2 text-emerald-600" />
                Đã Chấp Nhận
              </label>
            </div>
          )}

          {/* Notes - Optional */}
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="mr-2 text-emerald-600" />
              Ghi Chú
              <span className="text-gray-400 ml-2 text-xs">(Tùy chọn, tối đa 500 ký tự)</span>
            </label>
            <textarea
              {...register('notes')}
              rows="4"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                errors.notes
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
              }`}
              placeholder="Nhập ghi chú (tối đa 500 ký tự) hoặc để trống"
            />
            {errors.notes && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <X size={18} />
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Save size={18} />
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default HandoverRecordForm;
