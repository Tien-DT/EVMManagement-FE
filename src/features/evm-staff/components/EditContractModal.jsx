// src/features/evm-staff/components/EditContractModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { contractService } from '../../dealer-staff/services/contractService';

const { TextArea } = Input;

const EditContractModal = ({ visible, onClose, contract, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && visible) {
      form.setFieldsValue({
        code: contract.code,
        terms: contract.terms || '',
      });
    }
  }, [contract, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!contract?.id) {
        message.error('Không tìm thấy thông tin hợp đồng');
        setLoading(false);
        return;
      }

      // Build update data with all fields from original contract
      const updateData = {
        code: values.code, // Allow updating code
        orderId: contract.orderId,
        customerId: contract.customerId,
        dealerId: contract.dealerId,
        createdByUserId: contract.createdByUserId,
        signedByUserId: contract.signedByUserId,
        contractType: contract.contractType || 'B2B', // Keep original contractType
        terms: values.terms, // Allow updating terms
        status: contract.status, // Keep original status
        contractLink: contract.contractLink,
        signedAt: contract.signedAt,
      };

      const response = await contractService.updateContract(contract.id, updateData);

      if (response.success || response.data) {
        message.success('Cập nhật hợp đồng thành công!');
        form.resetFields();
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } else {
        throw new Error(response.message || 'Không thể cập nhật hợp đồng');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          error.message || 
                          'Không thể cập nhật hợp đồng';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get customer name for display
  const getCustomerName = () => {
    if (contract?.customer?.fullName) return contract.customer.fullName;
    if (contract?.customer?.name) return contract.customer.name;
    if (contract?.customerName) return contract.customerName;
    return 'N/A';
  };

  // Get order code for display
  const getOrderCode = () => {
    if (contract?.order?.code) return contract.order.code;
    if (contract?.orderCode) return contract.orderCode;
    return 'N/A';
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-blue-600" />
          <span>Chỉnh Sửa Hợp Đồng</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      width={700}
      confirmLoading={loading}
      okButtonProps={{
        style: {
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          color: '#ffffff',
          opacity: 1,
        }
      }}
    >
      <div className="space-y-4 mb-4">
        {/* Contract Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Thông tin đơn hàng</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Mã đơn:</span>
              <span className="ml-2 font-semibold">{getOrderCode()}</span>
            </div>
            <div>
              <span className="text-blue-700">Khách hàng:</span>
              <span className="ml-2 font-semibold">{getCustomerName()}</span>
            </div>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên hợp đồng (Mã hợp đồng)"
          name="code"
          rules={[{ required: true, message: 'Vui lòng nhập mã hợp đồng' }]}
        >
          <Input 
            placeholder="Nhập tên/mã hợp đồng..." 
          />
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

export default EditContractModal;
