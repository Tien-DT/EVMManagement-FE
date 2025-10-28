// src/features/evm-staff/pages/CreateHandoverRecordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import HandoverRecordForm from '../components/HandoverRecordForm';
import useHandoverRecords from '../hooks/useHandoverRecords';
import { useNotification } from '../../../context/NotificationContext';
import orderService from '../services/orderService';
import vehicleService from '../../../features/vehicle/services/vehicleService';

const CreateHandoverRecordPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { createRecord, loading } = useHandoverRecords();
  
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersRes = await orderService.getAllOrders({ pageNumber: 1, pageSize: 1000 });
        const ordersData = ordersRes.data?.items || ordersRes.items || [];
        setOrders(ordersData);
        
        // Fetch vehicles from all dealers (EVM vehicles)
        const vehiclesRes = await vehicleService.list({ pageNumber: 1, pageSize: 1000 });
        const vehiclesData = vehiclesRes.data?.items || vehiclesRes.items || [];
        setVehicles(vehiclesData);
        
        console.log('✅ Orders loaded:', ordersData.length);
        console.log('✅ Vehicles loaded:', vehiclesData.length);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        showError('Error loading orders and vehicles');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data) => {
    try {
      console.log('📤 Creating handover record with data:', data);
      
      // Backend expects: orderId, vehicleId, transportDetailId?, handoverDate?, notes?
      // Use camelCase to match backend API
      const payload = {
        orderId: data.orderId,
        vehicleId: data.vehicleId
      };
      
      // Optional fields - only include if they have values
      if (data.transportDetailId && data.transportDetailId.trim()) {
        payload.transportDetailId = data.transportDetailId;
      }
      if (data.handoverDate && data.handoverDate.trim()) {
        payload.handoverDate = data.handoverDate;
      }
      if (data.notes && data.notes.trim()) {
        payload.notes = data.notes;
      }
      
      console.log('📤 Payload to send:', JSON.stringify(payload, null, 2));
      console.log('📤 Payload details:', {
        orderId: payload.orderId,
        vehicleId: payload.vehicleId,
        transportDetailId: payload.transportDetailId,
        handoverDate: payload.handoverDate,
        notes: payload.notes
      });
      
      await createRecord(payload);
      showSuccess('Handover record created successfully!');
      navigate('/evm-staff/handover-records');
    } catch (error) {
      console.error('❌ Error creating handover record:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.title || error.response?.data?.errors?.[0] || error.message || 'Error occurred while creating handover record';
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
        {loadingData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-scaleIn">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
              <span className="ml-4 text-gray-600">Loading data...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-scaleIn">
            <HandoverRecordForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              isEdit={false}
              orders={orders}
              vehicles={vehicles}
            />
          </div>
        )}

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

