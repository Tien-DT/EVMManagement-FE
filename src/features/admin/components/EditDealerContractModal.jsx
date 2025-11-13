import React, { useState } from 'react';
import { X } from 'lucide-react';
import DealerContractForm from './DealerContractForm';
import dealerContractService from '../../evm-staff/services/dealerContractService';

const EditDealerContractModal = ({ 
  visible, 
  contract, 
  dealerInfo,
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await dealerContractService.updateContract(contract.id, formData);
      alert('Cập nhật hợp đồng thành công!');
      onSuccess();
    } catch (error) {
      console.error('❌ Error updating dealer contract:', error);
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Chỉnh sửa Hợp Đồng Dealer
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật thông tin bên dưới
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <DealerContractForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            initialData={contract}
            dealerInfo={dealerInfo}
            loading={loading}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditDealerContractModal;
