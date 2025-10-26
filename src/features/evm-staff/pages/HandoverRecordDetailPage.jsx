// src/features/evm-staff/pages/HandoverRecordDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  AlertCircle,
  CheckCircle,
  Package,
  Car,
  Calendar,
  FileText,
  Trash2,
  Edit
} from 'lucide-react';
import HandoverRecordForm from '../components/HandoverRecordForm';
import useHandoverRecords from '../hooks/useHandoverRecords';
import { useNotification } from '../../../context/NotificationContext';

const HandoverRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getRecordById, updateRecord, deleteRecord, loading } = useHandoverRecords();
  
  const [record, setRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoadingRecord(true);
        const data = await getRecordById(id);
        console.log('Fetched record data:', data);
        setRecord(data);
      } catch (error) {
        console.error('Error fetching record:', error);
        showError('Có lỗi xảy ra khi tải thông tin bàn giao');
        navigate('/evm-staff/handover-records');
      } finally {
        setLoadingRecord(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      console.log('Updating handover record with data:', data);
      await updateRecord(id, data);
      showSuccess('Cập nhật bản ghi bàn giao thành công!');
      setIsEditMode(false);
      // Refresh record data
      const updatedRecord = await getRecordById(id);
      setRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating handover record:', error);
      showError(error.message || 'Có lỗi xảy ra khi cập nhật bản ghi bàn giao');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi bàn giao này?')) {
      try {
        await deleteRecord(id);
        showSuccess('Xóa bản ghi bàn giao thành công!');
        navigate('/evm-staff/handover-records');
      } catch (error) {
        console.error('Error deleting handover record:', error);
        showError(error.message || 'Có lỗi xảy ra khi xóa bản ghi bàn giao');
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      navigate('/evm-staff/handover-records');
    }
  };

  if (loadingRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-center gap-4">
            <AlertCircle size={48} className="text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Không tìm thấy bản ghi</h3>
              <p className="text-red-700">Bản ghi bàn giao không tồn tại hoặc đã bị xóa</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/evm-staff/handover-records')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-semibold"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </button>

        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 animate-slideIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {isEditMode ? 'Chỉnh Sửa Bàn Giao' : 'Chi Tiết Bàn Giao'}
                </h1>
                <p className="text-gray-600 mt-1">ID: {record.id}</p>
              </div>
            </div>
            {!isEditMode && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {!isEditMode && (
            <div className="flex items-center gap-2">
              {record.isAccepted ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                  <CheckCircle size={16} className="mr-2" />
                  Đã Chấp Nhận
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200">
                  <AlertCircle size={16} className="mr-2" />
                  Chờ Xác Nhận
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        {isEditMode ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-scaleIn">
            <HandoverRecordForm
              onSubmit={handleUpdate}
              onCancel={handleCancel}
              initialData={{
                transportDetailId: record.transportDetailId || '',
                notes: record.notes || '',
                isAccepted: record.isAccepted || false,
                handoverDate: record.handoverDate ? new Date(record.handoverDate).toISOString().slice(0, 16) : ''
              }}
              loading={loading}
              isEdit={true}
            />
          </div>
        ) : (
          <>
            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 mb-8 animate-scaleIn">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                  <FileText className="text-white" size={20} />
                </div>
                Thông Tin Chi Tiết
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                      <Package size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 uppercase">ID Đơn Hàng</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">{record.orderId}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                      <Car size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600 uppercase">ID Xe</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">{record.vehicleId}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                      <Truck size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 uppercase">ID Thông Tin Vận Chuyển</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">{record.transportDetailId}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-orange-600 uppercase">Ngày Bàn Giao</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">
                    {new Date(record.handoverDate).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg flex items-center justify-center shadow-md">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 uppercase">Ngày Tạo</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">
                    {record.createdDate ? new Date(record.createdDate).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>

                {record.notes && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                        <FileText size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-yellow-600 uppercase">Ghi Chú</span>
                    </div>
                    <p className="text-gray-900 ml-13 whitespace-pre-wrap">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HandoverRecordDetailPage;

