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
  Edit,
  FileSignature
} from 'lucide-react';
import HandoverRecordForm from '../components/HandoverRecordForm';
import useHandoverRecords from '../hooks/useHandoverRecords';
import { useNotification } from '../../../context/NotificationContext';
import DigitalSignatureModal from '../components/DigitalSignatureModal';
import useDigitalSignature from '../hooks/useDigitalSignature';
import orderService from '../services/orderService';
import vehicleService from '../../vehicle/services/vehicleService';

const HandoverRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { getRecordById, updateRecord, deleteRecord, loading } = useHandoverRecords();
  
  const [record, setRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  
  const { checkIfSigned } = useDigitalSignature();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoadingRecord(true);
        const data = await getRecordById(id);
        console.log('Fetched record data:', data);
        setRecord(data);
        
        // Kiểm tra xem handover record đã được ký chưa
        const signed = await checkIfSigned('HandoverRecord', id);
        setIsSigned(signed);

        // Fetch order and vehicle info
        if (data.orderId) {
          try {
            const orderRes = await orderService.getOrderById(data.orderId);
            const orderData = orderRes.data || orderRes;
            setOrderInfo(orderData);
            console.log('✅ Order info loaded:', orderData);
          } catch (error) {
            console.error('❌ Error fetching order info:', error);
          }
        }

        if (data.vehicleId) {
          try {
            const vehicleRes = await vehicleService.getById(data.vehicleId);
            const vehicleData = vehicleRes.data || vehicleRes;
            setVehicleInfo(vehicleData);
            console.log('✅ Vehicle info loaded:', vehicleData);
          } catch (error) {
            console.error('❌ Error fetching vehicle info:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching record:', error);
        showError('Error occurred while loading handover information');
        navigate('/evm-staff/handover-records');
      } finally {
        setLoadingRecord(false);
      }
    };

    fetchRecord();
  }, [id, checkIfSigned]);

  const handleSignatureSuccess = async () => {
    showSuccess('Handover record signed successfully!');
    setIsSigned(true);
    setShowSignatureModal(false);
  };

  const handleUpdate = async (data) => {
    try {
      console.log('Updating handover record with data:', data);
      await updateRecord(id, data);
      showSuccess('Handover record updated successfully!');
      setIsEditMode(false);
      // Refresh record data
      const updatedRecord = await getRecordById(id);
      setRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating handover record:', error);
      showError(error.message || 'Error occurred while updating handover record');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this handover record?')) {
      try {
        await deleteRecord(id);
        showSuccess('Handover record deleted successfully!');
        navigate('/evm-staff/handover-records');
      } catch (error) {
        console.error('Error deleting handover record:', error);
        showError(error.message || 'Error occurred while deleting handover record');
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
          <p className="text-gray-600 font-semibold">Loading data...</p>
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
              <h3 className="text-lg font-bold text-red-900">Record Not Found</h3>
              <p className="text-red-700">Handover record does not exist or has been deleted</p>
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
          Back to List
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
                  {isEditMode ? 'Edit Handover' : 'Handover Details'}
                </h1>
                <p className="text-gray-600 mt-1">ID: {record.id}</p>
              </div>
            </div>
            {!isEditMode && (
              <div className="flex gap-3">
                {!isSigned && (
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    <FileSignature size={18} />
                    Sign Document
                  </button>
                )}
                {isSigned && (
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl font-semibold border border-green-200 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Signed
                  </span>
                )}
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
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
                  Accepted
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200">
                  <AlertCircle size={16} className="mr-2" />
                  Pending
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
                Detailed Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                      <Package size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 uppercase">Order</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{orderInfo?.code || 'N/A'}</p>
                  {orderInfo?.vehicleModel && (
                    <p className="text-sm text-gray-600 mt-1">{orderInfo.vehicleModel}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                      <Car size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600 uppercase">Vehicle</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{vehicleInfo?.name || vehicleInfo?.modelName || 'N/A'}</p>
                  {vehicleInfo?.modelName && vehicleInfo?.name !== vehicleInfo?.modelName && (
                    <p className="text-sm text-gray-600 mt-1">{vehicleInfo.modelName}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                      <Truck size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 uppercase">Transport Detail ID</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">{record.transportDetailId}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-orange-600 uppercase">Handover Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">
                    {new Date(record.handoverDate).toLocaleString('en-US')}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg flex items-center justify-center shadow-md">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 uppercase">Created Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">
                    {record.createdDate ? new Date(record.createdDate).toLocaleString('en-US') : 'N/A'}
                  </p>
                </div>

                {record.notes && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                        <FileText size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-yellow-600 uppercase">Notes</span>
                    </div>
                    <p className="text-gray-900 ml-13 whitespace-pre-wrap">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Digital Signature Modal */}
      {record && showSignatureModal && (
        <DigitalSignatureModal
          visible={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSuccess={handleSignatureSuccess}
          documentType="HandoverRecord"
          documentId={id}
          signerEmail={sessionStorage.getItem('userEmail') || 'staff@evm.com'}
          documentName={`Handover Record ${record.id?.slice(-8).toUpperCase()}`}
        />
      )}
    </div>
  );
};

export default HandoverRecordDetailPage;

