// src/features/dealer-manager/pages/DealerManagerContractsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Modal, Descriptions } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import FileUpload from '../../../components/FileUpload';

const DealerManagerContractsPage = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [signing, setSigning] = useState(false);
  const [uploadedContractUrl, setUploadedContractUrl] = useState('');

  useEffect(() => {
    if (user?.dealerId) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      // Get contracts by dealer
      const response = await axiosInstance.get(`${endpoints.contracts.getAll}?dealerId=${user.dealerId}`);
      console.log('Contracts loaded:', response);
      
      if (response.success && response.data) {
        setContracts(response.data.items || response.data || []);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      message.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = (contract) => {
    setSelectedContract(contract);
    setUploadedContractUrl('');
    setSignModalVisible(true);
  };

  const handleUploadComplete = (url) => {
    console.log('Contract uploaded to Supabase:', url);
    setUploadedContractUrl(url);
  };

  const handleConfirmSign = async () => {
    if (!selectedContract) return;
    
    if (!uploadedContractUrl) {
      message.error('Vui lòng upload ảnh hợp đồng đã ký!');
      return;
    }
    
    setSigning(true);
    try {
      // Update contract with uploaded link and status to ACTIVE (signed)
      await axiosInstance.put(endpoints.contracts.update(selectedContract.id), {
        ...selectedContract,
        status: 'ACTIVE', // ContractStatus.ACTIVE
        signedAt: new Date().toISOString(),
        contractLink: uploadedContractUrl, // URL from Supabase
      });

      message.success('Đã ký hợp đồng thành công!');
      setSignModalVisible(false);
      setSelectedContract(null);
      setUploadedContractUrl('');
      loadContracts();
    } catch (error) {
      console.error('Error signing contract:', error);
      message.error('Không thể ký hợp đồng');
    } finally {
      setSigning(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      DRAFT: { color: 'default', text: 'Nháp' },
      PENDING_SIGNATURE: { color: 'warning', text: 'Chờ ký' },
      ACTIVE: { color: 'success', text: 'Đã ký' },
      CANCELED: { color: 'error', text: 'Đã hủy' },
    };
    const config = statusMap[status] || statusMap.DRAFT;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Mã hợp đồng',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text) => <span className="font-mono font-semibold">{text}</span>,
    },
    {
      title: 'Đơn hàng',
      dataIndex: ['order', 'code'],
      key: 'orderCode',
      width: 150,
    },
    {
      title: 'Khách hàng / Dealer',
      dataIndex: ['customer', 'fullName'],
      key: 'customer',
      render: (text, record) => text || record.dealer?.name || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Ngày ký',
      dataIndex: 'signedAt',
      key: 'signedAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          {record.status === 'PENDING_SIGNATURE' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleSignContract(record)}
            >
              Ký hợp đồng
            </Button>
          )}
          {record.contractLink && (
            <Button
              size="small"
              href={record.contractLink}
              target="_blank"
            >
              Xem
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-xl" />
            <span>Hợp Đồng</span>
          </div>
        }
        extra={
          <Button onClick={loadContracts} loading={loading}>
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
          }}
        />
      </Card>

      {/* Sign Contract Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Ký Hợp Đồng</span>
          </div>
        }
        open={signModalVisible}
        onCancel={() => {
          setSignModalVisible(false);
          setSelectedContract(null);
        }}
        onOk={handleConfirmSign}
        okText="Xác nhận ký"
        cancelText="Hủy"
        confirmLoading={signing}
        width={700}
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleOutlined className="text-blue-600 mt-1" />
              <div className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong> 
                <ol className="mt-2 ml-4 space-y-1">
                  <li>1. Tải hợp đồng xuống (nếu có link) và in ra</li>
                  <li>2. Ký bản cứng hợp đồng</li>
                  <li>3. Chụp ảnh hoặc scan hợp đồng đã ký</li>
                  <li>4. Upload ảnh lên hệ thống bên dưới</li>
                  <li>5. Xác nhận ký hợp đồng</li>
                </ol>
              </div>
            </div>

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã hợp đồng" span={2}>
                <span className="font-mono font-semibold">{selectedContract.code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                {selectedContract.order?.code || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {selectedContract.createdDate ? new Date(selectedContract.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {selectedContract.createdByUserName || 'N/A'}
              </Descriptions.Item>
              {selectedContract.terms && (
                <Descriptions.Item label="Điều khoản" span={2}>
                  <div className="max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {selectedContract.terms}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Upload Signed Contract */}
            <div className="mt-4">
              <h4 className="font-medium mb-3">Upload hợp đồng đã ký:</h4>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                acceptedFileTypes="image/*,.pdf"
                maxFileSize={10}
              />
              {uploadedContractUrl && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    ✅ Đã upload hợp đồng thành công!
                  </p>
                  <a 
                    href={uploadedContractUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    Xem ảnh đã upload
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DealerManagerContractsPage;
