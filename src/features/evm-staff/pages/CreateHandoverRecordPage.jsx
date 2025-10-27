// src/features/evm-staff/pages/CreateHandoverRecordPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import HandoverRecordForm from '../components/HandoverRecordForm';
import useHandoverRecords from '../hooks/useHandoverRecords';
import { useNotification } from '../../../context/NotificationContext';

const CreateHandoverRecordPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { createRecord, loading } = useHandoverRecords();

  const handleSubmit = async (data) => {
    try {
      console.log('Creating handover record with data:', data);
      
      // Backend expects: OrderId, VehicleId, TransportDetailId?, HandoverDate?, Notes?
      const payload = {
        orderId: data.orderId,
        vehicleId: data.vehicleId,
        transportDetailId: data.transportDetailId || null,
        handoverDate: data.handoverDate || null,
        notes: data.notes || null
      };
      
      console.log('Payload to send:', payload);
      
      await createRecord(payload);
      showSuccess('Handover record created successfully!');
      navigate('/evm-staff/handover-records');
    } catch (error) {
      console.error('Error creating handover record:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error occurred while creating handover record';
      showError(errorMsg);
    }
  };

  const handleCancel = () => {
    navigate('/evm-staff/handover-records');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to List
        </button>

        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 animate-slideIn">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Create New Vehicle Handover
              </h1>
              <p className="text-gray-600 mt-1">Enter detailed information to create vehicle handover record</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-scaleIn">
          <HandoverRecordForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            isEdit={false}
          />
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg animate-slideIn">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Notes when creating handover:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Ensure order and vehicle are assigned before creating handover</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Transport information must be prepared and confirmed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Handover date should be set after all procedures are completed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Detailed notes will help track the handover process more easily</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHandoverRecordPage;

