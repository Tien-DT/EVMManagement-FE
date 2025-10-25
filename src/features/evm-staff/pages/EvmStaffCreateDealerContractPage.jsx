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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/evm-staff/contracts')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg mr-3 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo hợp đồng mới</h1>
            <p className="text-gray-600 mt-1">Tạo hợp đồng cho đơn hàng và khách hàng</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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

      {/* Data Status */}
      {!loadingData && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Package size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-purple-900">Dữ liệu đã tải</h3>
              <p className="text-xs text-purple-700 mt-1">
                {orders.length} đơn hàng • {customers.length} khách hàng
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvmStaffCreateDealerContractPage;
