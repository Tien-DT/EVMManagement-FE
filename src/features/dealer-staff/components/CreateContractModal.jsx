// src/features/dealer-staff/components/CreateContractModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useAuth } from '../../../hooks/useAuth';
import userProfileService from '../../../services/userProfileService';
import { contractService } from '../services/contractService';

const { TextArea } = Input;

const CreateContractModal = ({ visible, onClose, order, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Validate required fields
      if (!order?.id) {
        message.error('Không tìm thấy thông tin đơn hàng');
        setLoading(false);
        return;
      }

      // Get createdByUserId (UserProfile ID, NOT account ID)
      let createdByUserId = user?.userProfileId; // Try to get from cached user object
      
      // If not available, fetch from API using account ID
      if (!createdByUserId) {
        console.log('⚠️ userProfileId not in user object, fetching from API...');
        try {
          const accountId = user?.id; // Account ID
          if (!accountId) {
            message.error('Không tìm thấy thông tin tài khoản');
            setLoading(false);
            return;
          }

          const profileResponse = await userProfileService.getByAccount(accountId);
          
          if (profileResponse && (profileResponse.success || profileResponse.data)) {
            const profileData = profileResponse.data;
            createdByUserId = profileData.id; // UserProfile ID
            console.log('✅ Fetched userProfileId from API:', createdByUserId);
            
            // Cache it for next time
            localStorage.setItem('userProfile', JSON.stringify(profileData));
          } else {
            message.error('Không thể lấy thông tin UserProfile');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
          message.error('Lỗi khi lấy thông tin UserProfile');
          setLoading(false);
          return;
        }
      }

      if (!createdByUserId) {
        message.error('Không tìm thấy thông tin UserProfile ID');
        setLoading(false);
        return;
      }

      // Get customerId and dealerId from order (B2C contracts need customerId)
      const customerId = order.customerId || order.customer?.id;
      const dealerId = order.dealerId;

      if (!customerId) {
        message.error('Không tìm thấy thông tin khách hàng trong đơn hàng');
        setLoading(false);
        return;
      }

      if (!dealerId) {
        message.error('Không tìm thấy thông tin dealer trong đơn hàng');
        setLoading(false);
        return;
      }

      // Build contract data with all fields (B2C contract)
      const contractData = {
        code: values.code || `CONTRACT-${Date.now().toString().slice(-8)}`,
        orderId: order.id,
        customerId: customerId, // B2C contracts have customerId
        dealerId: dealerId, // ID của dealer (company) - from order
        createdByUserId: createdByUserId, // ID của dealer staff tạo contract
        signedByUserId: null, // Nullable - will be set later when signed
        contractType: 'B2C', // B2C = contract with customer, B2B = contract between EVM and Dealer
        terms: values.terms || '', // Terms of contract
        status: 'PENDING_SIGNATURE', // Initial status after creation
        signedAt: null, // Nullable - will be set when PDF uploaded
        contractLink: null, // Nullable - will be set when PDF uploaded
      }

      console.log('📝 Creating contract with data:', contractData);
      console.log('   - code:', contractData.code);
      console.log('   - orderId:', order.id);
      console.log('   - customerId:', customerId, '(B2C - with customer)');
      console.log('   - dealerId (dealer company):', dealerId);
      console.log('   - createdByUserId (UserProfile ID):', createdByUserId);
      console.log('   - signedByUserId:', null, '(will be set later)');
      console.log('   - contractType:', 'B2C', '(B2C or B2B)');
      console.log('   - terms:', values.terms || '');
      console.log('   - status:', 'PENDING_SIGNATURE');
      console.log('   - signedAt:', null, '(will be set on upload)');
      console.log('   - contractLink:', null, '(will be set on upload)');
      console.log('   - user.id (account ID):', user?.id);
      console.log('   - user.userProfileId (cached):', user?.userProfileId);

      const response = await contractService.createContract(contractData);

      if (response.success || response.data) {
        const createdContract = response.data || response;
        console.log('✅ Contract created successfully:', createdContract);
        
        // Update order status to CREATED_CONTRACT and link contractId
        if (createdContract?.id && order?.id) {
          try {
            console.log('Updating order status to CREATED_CONTRACT...');
            
            // Build order update data with all non-null fields
            const orderUpdateData = {
              code: order.code,
              dealerId: order.dealerId,
              status: 'CREATED_CONTRACT', // Update status
              orderType: order.orderType,
              contractId: createdContract.id, // Link contract
            };
            
            // Add optional fields if they exist
            if (order.customerId) orderUpdateData.customerId = order.customerId;
            if (order.quotationId) orderUpdateData.quotationId = order.quotationId;
            if (order.handoverRecordId) orderUpdateData.handoverRecordId = order.handoverRecordId;
            if (order.depositId) orderUpdateData.depositId = order.depositId;
            if (order.note) orderUpdateData.note = order.note;
            if (order.totalAmount) orderUpdateData.totalAmount = order.totalAmount;
            if (order.discount) orderUpdateData.discount = order.discount;
            if (order.discountAmount) orderUpdateData.discountAmount = order.discountAmount;
            if (order.finalAmount) orderUpdateData.finalAmount = order.finalAmount;
            if (order.handoverDate) orderUpdateData.handoverDate = order.handoverDate;
            if (order.expectedDeliveryAt) orderUpdateData.expectedDeliveryAt = order.expectedDeliveryAt;
            
            console.log('Order update payload:', orderUpdateData);
            
            await axiosInstance.put(endpoints.orders.update(order.id), orderUpdateData);
            console.log('✅ Order status updated to CREATED_CONTRACT');
          } catch (updateError) {
            console.error('❌ Error updating order status:', updateError);
            message.warning('Hợp đồng đã tạo nhưng không thể cập nhật trạng thái đơn hàng');
          }
        }
        
        message.success('Tạo hợp đồng thành công!');
        form.resetFields();
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
        
        // Navigate to contracts page after successful creation
        setTimeout(() => {
          navigate('/dealer-staff/contracts');
        }, 500);
      } else {
        throw new Error(response.message || 'Không thể tạo hợp đồng');
      }
    } catch (error) {
      console.error('❌ Error creating contract:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          error.message || 
                          'Không thể tạo hợp đồng';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get customer name for display
  const getCustomerName = () => {
    if (order?.customer?.fullName) return order.customer.fullName;
    if (order?.customer?.name) return order.customer.name;
    if (order?.customerName) return order.customerName;
    return 'N/A';
  };

  // Get quotation info if available
  const getQuotationInfo = () => {
    if (order?.quotation) {
      return {
        code: order.quotation.code,
        total: order.quotation.total || order.quotation.totalAmount
      };
    }
    return null;
  };

  const quotation = getQuotationInfo();

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-blue-600" />
          <span>Tạo Hợp Đồng</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Tạo hợp đồng"
      cancelText="Hủy"
      width={700}
      confirmLoading={loading}
      okButtonProps={{
        style: {
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          color: '#ffffff',
          opacity: 1
        }
      }}
    >
      <div className="space-y-4 mb-4">
        {/* Order Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Thông tin đơn hàng</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Mã đơn:</span>
              <span className="ml-2 font-semibold">{order?.code}</span>
            </div>
            <div>
              <span className="text-blue-700">Khách hàng:</span>
              <span className="ml-2 font-semibold">{getCustomerName()}</span>
            </div>
            {quotation && (
              <>
                <div>
                  <span className="text-blue-700">Mã báo giá:</span>
                  <span className="ml-2 font-semibold">{quotation.code}</span>
                </div>
                <div>
                  <span className="text-blue-700">Tổng tiền:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.total || 0)}
                  </span>
                </div>
              </>
            )}
            {!quotation && order?.finalAmount && (
              <div className="col-span-2">
                <span className="text-blue-700">Tổng tiền:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalAmount || order.totalAmount || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên hợp đồng (Mã hợp đồng)"
          name="code"
          rules={[{ required: true, message: 'Vui lòng nhập tên hợp đồng' }]}
        >
          <Input placeholder="Nhập tên/mã hợp đồng..." />
        </Form.Item>

        <Form.Item
          label="Điều khoản hợp đồng"
          name="terms"
          rules={[{ required: true, message: 'Vui lòng nhập điều khoản hợp đồng' }]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập các điều khoản và điều kiện của hợp đồng..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateContractModal;

