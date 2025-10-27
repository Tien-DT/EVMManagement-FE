// src/features/evm-staff/components/CreateContractModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useAuth } from '../../../hooks/useAuth';

const { TextArea } = Input;

const CreateContractModal = ({ visible, onClose, order, quotation, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Generate contract code
      const contractCode = `CONTRACT-${Date.now().toString().slice(-8)}`;

      // Check if quotation is accepted
      if (quotation?.status !== 'ACCEPTED') {
        message.error('Chỉ có thể tạo hợp đồng khi báo giá đã được chấp nhận');
        return;
      }

      let customerId = order.customerId;

      // For B2B orders without customer, create customer from dealer info
      if (!customerId && order.dealerId) {
        try {
          console.log('B2B order without customer, creating customer from dealer info...');
          
          // Fetch dealer info
          const dealerResponse = await axiosInstance.get(`/v1/Dealers/${order.dealerId}`);
          const dealer = dealerResponse.data;
          
          // Create customer from dealer
          const customerData = {
            fullName: dealer.name || 'Dealer Company',
            phone: dealer.phone || '0000000000',
            email: dealer.email,
            address: dealer.address || '',
          };
          
          const customerResponse = await axiosInstance.post(endpoints.customers.create, customerData);
          customerId = customerResponse.data?.id || customerResponse.data;
          
          console.log('Customer created for B2B contract:', customerId);
          
          // Update order with customerId
          await axiosInstance.put(endpoints.orders.update(order.id), {
            ...order,
            customerId: customerId,
          });
          
        } catch (customerError) {
          console.error('Error creating customer:', customerError);
          message.error('Không thể tạo thông tin khách hàng cho hợp đồng');
          setLoading(false);
          return;
        }
      }

      const contractData = {
        code: contractCode,
        orderId: order.id,
        customerId: customerId,
        createdByUserId: user?.userProfileId || user?.id,
        terms: values.terms || '',
        status: 'PENDING_SIGNATURE', // ContractStatus.PENDING_SIGNATURE
        contractLink: values.contractLink || '',
      };

      console.log('Creating contract:', contractData);

      const response = await axiosInstance.post(endpoints.contracts.create, contractData);

      if (response.success || response.data) {
        message.success('Tạo hợp đồng thành công! Dealer Manager sẽ nhận được thông báo để ký hợp đồng.');
        form.resetFields();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      message.error(error.response?.data?.message || 'Không thể tạo hợp đồng');
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
            <strong>Lưu ý:</strong> Sau khi tạo hợp đồng, Dealer Manager sẽ nhận được thông báo 
            và cần ký hợp đồng thông qua xác thực OTP qua email.
          </p>
        </div>
      </div>

      <Form form={form} layout="vertical">
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

        <Form.Item
          label="Link hợp đồng (nếu có)"
          name="contractLink"
        >
          <Input
            placeholder="https://..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateContractModal;
