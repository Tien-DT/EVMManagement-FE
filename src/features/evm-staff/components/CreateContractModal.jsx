// src/features/evm-staff/components/CreateContractModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useAuth } from '../../../hooks/useAuth';
import userProfileService from '../../../services/userProfileService';

const { TextArea } = Input;

const CreateContractModal = ({ visible, onClose, order, quotation, onSuccess }) => {
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

      // Get dealerId from order (dealer company ID, not user ID)
      const dealerId = order.dealerId;

      if (!dealerId) {
        message.error('Không tìm thấy thông tin dealer trong đơn hàng');
        setLoading(false);
        return;
      }

      const contractData = {
        code: values.code || `CONTRACT-${Date.now().toString().slice(-8)}`,
        orderId: order.id,
        dealerId: dealerId, // ID của dealer (company) - from order
        createdByUserId: createdByUserId, // ID của EVM staff tạo contract
        contractType: 'B2B', // Mặc định B2B (Business to Business)
        terms: values.terms || '',
        status: 'PENDING_SIGNATURE',
        // customerId, signedByUserId, signedAt, contractLink are nullable - skip them
      };

      console.log('📝 Creating contract with data:', contractData);
      console.log('   - orderId:', order.id);
      console.log('   - dealerId (dealer company):', dealerId);
      console.log('   - createdByUserId (UserProfile ID):', createdByUserId);
      console.log('   - contractType:', 'B2B');
      console.log('   - user.id (account ID):', user?.id);
      console.log('   - user.userProfileId (cached):', user?.userProfileId);

      const response = await axiosInstance.post(endpoints.contracts.create, contractData);

      if (response.success || response.data) {
        message.success('Tạo hợp đồng thành công!');
        form.resetFields();
        onClose();
        
        // Navigate to contracts page after successful creation
        setTimeout(() => {
          navigate('/evm-staff/contracts');
        }, 500);
      } else {
        throw new Error(response.message || 'Không thể tạo hợp đồng');
      }
    } catch (error) {
      console.error('❌ Error creating contract:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Không thể tạo hợp đồng';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-blue-700">Dealer:</span>
              <span className="ml-2 font-semibold">{order?.dealer?.name || 'N/A'}</span>
            </div>
            {quotation && (
              <>
                <div>
                  <span className="text-blue-700">Mã báo giá:</span>
                  <span className="ml-2 font-semibold">{quotation?.code}</span>
                </div>
                <div>
                  <span className="text-blue-700">Tổng tiền:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation?.total || 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Hợp đồng sẽ được tạo với trạng thái "Chờ ký". 
            Sau khi upload PDF hợp đồng đã ký, trạng thái sẽ tự động chuyển sang "Đang hoạt động".
          </p>
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
