import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Building
} from 'lucide-react';
import DealerContractForm from '../components/DealerContractForm';
import useDealerContracts from '../hooks/useDealerContracts';
import dealerService from '../services/dealerService';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffCreateDealerContractPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { createContract, loading } = useDealerContracts();
  
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  // Fetch dealers list from real API
  useEffect(() => {
    const fetchDealers = async () => {
      setLoadingDealers(true);
      try {
        console.log('Fetching dealers from API...');
        const response = await dealerService.getAllDealers();
        console.log('Dealers response:', response);
        
        // Response structure: { data: { items: [...] } }
        const dealersList = response.items || [];
        setDealers(dealersList);
        console.log('Dealers loaded:', dealersList.length);
      } catch (error) {
        console.error('Error fetching dealers:', error);
        showNotification('Có lỗi xảy ra khi tải danh sách đại lý', 'error');
      } finally {
        setLoadingDealers(false);
      }
    };

    fetchDealers();
  }, [showNotification]);

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting contract data:', formData);
      const response = await createContract(formData);
      console.log('Contract created successfully:', response);
      showNotification('Tạo hợp đồng thành công!', 'success');
      navigate('/evm-staff/contracts');
    } catch (error) {
      console.error('Error creating contract:', error);
      showNotification(
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng', 
        'error'
      );
    }
  };

  const handleCancel = () => {
    navigate('/evm-staff/contracts');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/evm-staff/contracts')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo hợp đồng đại lý</h1>
            <p className="text-gray-600 mt-1">Tạo hợp đồng mới cho đại lý</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingDealers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách đại lý...</span>
          </div>
        </div>
      )}

      {/* Form */}
      {!loadingDealers && (
        <DealerContractForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          dealers={dealers}
        />
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Thông tin hợp đồng</h3>
              <p className="text-xs text-blue-700 mt-1">
                Nhập đầy đủ thông tin hợp đồng để tạo thành công
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg mr-3">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-900">Lưu ý quan trọng</h3>
              <p className="text-xs text-amber-700 mt-1">
                Kiểm tra kỹ thông tin trước khi tạo hợp đồng
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-900">Trạng thái</h3>
              <p className="text-xs text-green-700 mt-1">
                Hợp đồng sẽ được tạo ở trạng thái "Bản nháp"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvmStaffCreateDealerContractPage;
