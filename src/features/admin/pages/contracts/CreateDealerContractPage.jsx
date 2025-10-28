import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import DealerContractForm from '../../components/DealerContractForm';
import dealerContractService from '../../../evm-staff/services/dealerContractService';
import dealerService from '../../../dealer/services/dealerService';

const CreateDealerContractPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  // Fetch dealers
  useEffect(() => {
    const fetchDealers = async () => {
      setLoadingDealers(true);
      try {
        const response = await dealerService.list({ pageNumber: 1, pageSize: 100 });
        console.log('✅ Dealers API response:', response);
        
        // Try multiple ways to extract dealers list
        let dealersData = [];
        if (response.data?.items) {
          dealersData = response.data.items;
        } else if (response.items) {
          dealersData = response.items;
        } else if (Array.isArray(response.data)) {
          dealersData = response.data;
        } else if (Array.isArray(response)) {
          dealersData = response;
        }
        
        setDealers(dealersData);
        console.log('✅ Dealers loaded:', dealersData.length, 'First dealer:', dealersData[0]);
      } catch (error) {
        console.error('❌ Error loading dealers:', error);
        console.error('❌ Error details:', error.response?.data);
        alert('Không thể tải danh sách Dealers: ' + (error.message || 'Unknown error'));
      } finally {
        setLoadingDealers(false);
      }
    };

    fetchDealers();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      console.log('📤 Submit: Original form data:', formData);
      console.log('📤 Submit: Form data stringified:', JSON.stringify(formData, null, 2));
      setLoading(true);
      const response = await dealerContractService.createContract(formData);
      console.log('✅ Submit: Dealer contract created successfully:', response);
      alert('Tạo hợp đồng thành công!');
      navigate('/admin/dealer-contracts');
    } catch (error) {
      console.error('❌ Submit: Error creating dealer contract:', error);
      console.error('❌ Submit: Error response:', error.response?.data);
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dealer-contracts');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/dealer-contracts')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Tạo Hợp Đồng Dealer</h1>
          <p className="text-gray-500 mt-1">Tạo hợp đồng giữa EVM và Dealer</p>
        </div>
      </div>

      {/* Loading Dealers */}
      {loadingDealers && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách Dealers...</span>
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
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Thông tin hợp đồng</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Nhập đầy đủ thông tin bắt buộc
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Lưu ý</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kiểm tra kỹ trước khi tạo
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Trạng thái</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tạo ở trạng thái "Bản nháp"
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Dữ liệu</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {dealers.length} dealers có sẵn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDealerContractPage;

