import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import DealerContractForm from '../components/DealerContractForm';
import useDealerContracts from '../hooks/useDealerContracts';
import { orderService } from '../../dealer-staff/services/orderService';
import { customerService } from '../../dealer-staff/services/customerService';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffCreateDealerContractPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { createContract, loading } = useDealerContracts();
  
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch orders and customers
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        console.log('Fetching orders and customers from API...');
        
        // Fetch orders with larger pageSize
        const ordersResponse = await orderService.getAllOrders(1, 100);
        console.log('Orders full response:', ordersResponse);
        
        // Try multiple ways to extract data
        let ordersList = [];
        if (ordersResponse.data?.items) {
          ordersList = ordersResponse.data.items;
        } else if (ordersResponse.items) {
          ordersList = ordersResponse.items;
        } else if (Array.isArray(ordersResponse.data)) {
          ordersList = ordersResponse.data;
        } else if (Array.isArray(ordersResponse)) {
          ordersList = ordersResponse;
        }
        
        setOrders(ordersList);
        console.log('Orders loaded:', ordersList.length, 'First item:', ordersList[0]);

        // Fetch customers with larger pageSize
        const customersResponse = await customerService.getAllCustomers(1, 100);
        console.log('Customers full response:', customersResponse);
        
        // Try multiple ways to extract data
        let customersList = [];
        if (customersResponse.data?.items) {
          customersList = customersResponse.data.items;
        } else if (customersResponse.items) {
          customersList = customersResponse.items;
        } else if (Array.isArray(customersResponse.data)) {
          customersList = customersResponse.data;
        } else if (Array.isArray(customersResponse)) {
          customersList = customersResponse;
        }
        
        setCustomers(customersList);
        console.log('Customers loaded:', customersList.length, 'First item:', customersList[0]);
        
        // Show warning if no data
        if (ordersList.length === 0) {
          console.warn('⚠️ No orders found! Check API response structure');
        }
        if (customersList.length === 0) {
          console.warn('⚠️ No customers found! Check API response structure');
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data);
        showError('Có lỗi xảy ra khi tải dữ liệu: ' + (error.message || 'Unknown error'));
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [showError]);

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting contract data:', formData);
      const response = await createContract(formData);
      console.log('Contract created successfully:', response);
      showSuccess('Tạo hợp đồng thành công!');
      navigate('/evm-staff/contracts');
    } catch (error) {
      console.error('Error creating contract:', error);
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    }
  };

  const handleCancel = () => {
    navigate('/evm-staff/contracts');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/evm-staff/contracts')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Tạo Hợp Đồng Mới</h1>
          <p className="text-gray-500 mt-1">Tạo hợp đồng cho đơn hàng và khách hàng</p>
        </div>
      </div>

      {/* Loading State */}
      {loadingData && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      {/* Form */}
      {!loadingData && (
        <DealerContractForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          orders={orders}
          customers={customers}
        />
      )}

      {/* Info Cards */}
      {!loadingData && (
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
                  {orders.length} đơn hàng • {customers.length} khách hàng
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffCreateDealerContractPage;
