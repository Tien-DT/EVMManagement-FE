// src/features/dealer-manager/components/AcceptQuotationModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Table, message, Spin } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';

const AcceptQuotationModal = ({ visible, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [loadingQuotation, setLoadingQuotation] = useState(false);

  useEffect(() => {
    if (visible && order?.quotationId) {
      loadQuotation();
    }
  }, [visible, order]);

  const loadQuotation = async () => {
    setLoadingQuotation(true);
    try {
      const response = await axiosInstance.get(endpoints.quotations.getById(order.quotationId));
      console.log('Quotation loaded:', response.data);
      setQuotation(response.data);
    } catch (error) {
      console.error('Error loading quotation:', error);
      message.error('Không thể tải thông tin báo giá');
    } finally {
      setLoadingQuotation(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Step 1: Update Quotation status to ACCEPTED
      await axiosInstance.put(endpoints.quotations.update(order.quotationId), {
        status: 'ACCEPTED' // QuotationStatus.ACCEPTED
      });

      // Step 2: Update Order with total amounts from quotation
      await axiosInstance.put(endpoints.orders.update(order.id), {
        ...order,
        totalAmount: quotation.subtotal || 0,
        finalAmount: quotation.total || 0,
        discountAmount: 0,
      });

      message.success('Đã chấp nhận báo giá thành công!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error accepting quotation:', error);
      message.error(error.response?.data?.message || 'Không thể chấp nhận báo giá');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const columns = [
    {
      title: 'Xe',
      dataIndex: 'vehicleVariantName',
      key: 'vehicleVariantName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text || 'N/A'}</div>
          <div className="text-xs text-gray-500">{record.note}</div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      align: 'right',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 100,
      align: 'center',
      render: (discount) => `${discount}%`,
    },
    {
      title: 'Thành tiền',
      key: 'lineTotal',
      width: 150,
      align: 'right',
      render: (_, record) => {
        const subtotal = record.unitPrice * record.quantity;
        const discount = subtotal * (record.discountPercent / 100);
        return formatCurrency(subtotal - discount);
      },
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CheckCircleOutlined className="text-green-600" />
          <span>Chấp nhận Báo giá</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleAccept}
      okText="Chấp nhận báo giá"
      cancelText="Hủy"
      width={900}
      confirmLoading={loading}
      okButtonProps={{ 
        type: 'primary',
        danger: false,
        style: { backgroundColor: '#52c41a' }
      }}
    >
      {loadingQuotation ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải thông tin báo giá...</p>
        </div>
      ) : quotation ? (
        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationCircleOutlined className="text-yellow-600 mt-1" />
            <div className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Sau khi chấp nhận báo giá, tổng tiền đơn hàng sẽ được cập nhật 
              và EVM Staff sẽ tạo hợp đồng cho bạn. Bạn sẽ cần ký hợp đồng trước khi thanh toán đặt cọc.
            </div>
          </div>

          {/* Quotation Info */}
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Mã báo giá" span={2}>
              <span className="font-mono font-semibold">{quotation.code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {quotation.createdDate ? new Date(quotation.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Hiệu lực đến">
              {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('vi-VN') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo" span={2}>
              {quotation.createdByUserName || 'N/A'}
            </Descriptions.Item>
            {quotation.note && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {quotation.note}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Quotation Details */}
          <div>
            <h4 className="font-medium mb-2">Chi tiết báo giá:</h4>
            <Table
              columns={columns}
              dataSource={quotation.quotationDetails || []}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
            />
          </div>

          {/* Total Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính:</span>
              <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Thuế (10%):</span>
              <span className="font-medium">{formatCurrency(quotation.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Tổng cộng:</span>
              <span className="text-green-600">{formatCurrency(quotation.total)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy thông tin báo giá
        </div>
      )}
    </Modal>
  );
};

export default AcceptQuotationModal;
