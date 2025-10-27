// src/features/evm-staff/components/CreateDepositModal.jsx
import React, { useState } from 'react';
import { Modal, Form, InputNumber, Select, Input, message } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const { TextArea } = Input;
const { Option } = Select;

const CreateDepositModal = ({ visible, onClose, order, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const depositData = {
        orderId: order.id,
        amount: values.amount,
        method: values.method, // PaymentMethod enum
        status: 'PENDING', // DepositStatus.PENDING
        note: values.note || '',
      };

      console.log('Creating deposit:', depositData);

      const response = await axiosInstance.post(endpoints.deposits.create, depositData);

      if (response.success || response.data) {
        message.success('Tạo yêu cầu đặt cọc thành công!');
        form.resetFields();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
      message.error(error.response?.data?.message || 'Không thể tạo yêu cầu đặt cọc');
    } finally {
      setLoading(false);
    }
  };

  // Calculate suggested deposit amount (30% of total)
  const suggestedAmount = order?.finalAmount ? Math.round(order.finalAmount * 0.3) : 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <DollarCircleOutlined className="text-green-600" />
          <span>Tạo Yêu Cầu Đặt Cọc</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Tạo yêu cầu"
      cancelText="Hủy"
      width={600}
      confirmLoading={loading}
    >
      <div className="space-y-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Thông tin đơn hàng</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Mã đơn:</span>
              <span className="ml-2 font-semibold">{order?.code}</span>
            </div>
            <div>
              <span className="text-blue-700">Tổng tiền:</span>
              <span className="ml-2 font-semibold text-green-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order?.finalAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Gợi ý:</strong> Thông thường đặt cọc 30% giá trị đơn hàng = {' '}
            <span className="font-semibold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(suggestedAmount)}
            </span>
          </p>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Số tiền đặt cọc"
          name="amount"
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền' },
            { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0' },
          ]}
          initialValue={suggestedAmount}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            addonAfter="VND"
          />
        </Form.Item>

        <Form.Item
          label="Phương thức thanh toán"
          name="method"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
          initialValue="BANK_TRANSFER"
        >
          <Select>
            <Option value="BANK_TRANSFER">Chuyển khoản ngân hàng</Option>
            <Option value="CASH">Tiền mặt</Option>
            <Option value="CREDIT_CARD">Thẻ tín dụng</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="note"
        >
          <TextArea
            rows={3}
            placeholder="Thông tin tài khoản ngân hàng, hạn thanh toán..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDepositModal;
