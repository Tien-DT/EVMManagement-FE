import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit,
  Trash2,
  FileText,
  User,
  Car,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import useQuotations from '../hooks/useQuotations';
import { useNotification } from '../../../context/NotificationContext';

const EvmStaffQuotationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const { getQuotationById, deleteQuotation } = useQuotations();
  
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotation = async () => {
      setLoading(true);
      try {
        const data = await getQuotationById(id);
        setQuotation(data);
      } catch (error) {
        showError('Không thể tải thông tin báo giá');
      } finally {
        setLoading(false);
      }
    };
    loadQuotation();
  }, [id, getQuotationById, showError]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <FileText size={20} />;
      case 'sent': return <Clock size={20} />;
      case 'approved': return <CheckCircle size={20} />;
      case 'rejected': return <XCircle size={20} />;
      case 'expired': return <AlertCircle size={20} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'draft': return 'Bản nháp';
      case 'sent': return 'Đã gửi';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Bị từ chối';
      case 'expired': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      try {
        await deleteQuotation(id);
        showSuccess('Xóa báo giá thành công!');
        navigate('/evm-staff/quotations');
      } catch (error) {
        showError('Có lỗi xảy ra khi xóa báo giá');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/evm-staff/quotations/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy báo giá</h3>
        <button
          onClick={() => navigate('/evm-staff/quotations')}
          className="text-emerald-600 hover:text-emerald-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/evm-staff/quotations')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết báo giá</h1>
            <p className="text-gray-600 mt-1">Mã báo giá: {quotation.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <Edit size={16} className="mr-2" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trạng thái</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
              {getStatusIcon(quotation.status)}
              <span className="ml-2">{getStatusText(quotation.status)}</span>
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Ngày tạo</p>
            <div className="flex items-center text-gray-900 mt-1">
              <Calendar size={16} className="mr-2" />
              {new Date(quotation.createdAt || Date.now()).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User size={20} className="mr-2" />
          Thông tin đại lý
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tên đại lý</p>
            <p className="text-gray-900 font-medium">{quotation.dealerName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-gray-900 font-medium">{quotation.dealerEmail || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Car size={20} className="mr-2" />
          Thông tin xe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mẫu xe</p>
            <p className="text-gray-900 font-medium">{quotation.vehicleModel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phiên bản</p>
            <p className="text-gray-900 font-medium">{quotation.vehicleVariant}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số lượng</p>
            <p className="text-gray-900 font-medium flex items-center">
              <Package size={16} className="mr-2" />
              {quotation.quantity}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign size={20} className="mr-2" />
          Thông tin giá
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Đơn giá:</span>
            <span className="font-medium">{formatCurrency(quotation.unitPrice || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Số lượng:</span>
            <span className="font-medium">{quotation.quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tổng tiền:</span>
            <span className="font-medium">{formatCurrency(quotation.totalPrice || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giảm giá ({quotation.discount || 0}%):</span>
            <span className="font-medium text-red-600">
              -{formatCurrency((quotation.totalPrice || 0) * (quotation.discount || 0) / 100)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Thành tiền:</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(quotation.finalPrice || 0)}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-600">Có hiệu lực đến:</span>
            <span className="font-medium">
              {quotation.validUntil 
                ? new Date(quotation.validUntil).toLocaleDateString('vi-VN')
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(quotation.notes || quotation.terms) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Thông tin bổ sung
          </h3>
          {quotation.notes && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
              <p className="text-gray-900 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}
          {quotation.terms && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Điều khoản:</p>
              <p className="text-gray-900 whitespace-pre-wrap">{quotation.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvmStaffQuotationDetailPage;

