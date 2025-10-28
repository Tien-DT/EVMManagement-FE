import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import dealerContractService from "../../../evm-staff/services/dealerContractService";
import dealerService from "../../../dealer/services/dealerService";

const DealerContractDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [dealerInfo, setDealerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await dealerContractService.getContractById(id);
      const contractData = response.data || response;
      setContract(contractData);
      console.log("✅ Contract details loaded:", contractData);
      console.log("📅 Date fields in contract:", {
        createdAt: contractData.createdAt,
        createdDate: contractData.createdDate,
        created_date: contractData.created_date,
        created_at: contractData.created_at,
        signedAt: contractData.signedAt,
        signedDate: contractData.signedDate,
        signed_date: contractData.signed_date,
        signed_at: contractData.signed_at
      });
      
      // Fetch dealer info if dealerId exists
      if (contractData.dealerId) {
        try {
          const dealerResponse = await dealerService.getById(contractData.dealerId);
          const dealerData = dealerResponse.data || dealerResponse;
          setDealerInfo(dealerData);
          console.log("✅ Dealer info loaded:", dealerData);
        } catch (error) {
          console.error("❌ Error fetching dealer info:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching contract details:", error);
      alert("Không thể tải thông tin hợp đồng");
      navigate("/admin/dealer-contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Implement delete if API exists
      alert("Tính năng xóa sẽ được cập nhật sau");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting contract:", error);
      alert("Lỗi khi xóa hợp đồng");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      return `lúc ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${day} tháng ${month}, ${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DRAFT":
        return <FileText size={20} className="text-gray-600" />;
      case "PENDING_SIGNATURE":
        return <Clock size={20} className="text-amber-600" />;
      case "ACTIVE":
        return <CheckCircle size={20} className="text-emerald-600" />;
      case "CANCELED":
        return <XCircle size={20} className="text-slate-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-50 text-gray-700 border border-gray-200";
      case "PENDING_SIGNATURE":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "CANCELED":
        return "bg-slate-50 text-slate-600 border border-slate-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DRAFT":
        return "Bản nháp";
      case "PENDING_SIGNATURE":
        return "Chờ ký";
      case "ACTIVE":
        return "Đang hoạt động";
      case "CANCELED":
        return "Đã hủy";
      default:
        return "Unknown";
    }
  };

  if (loading || !contract) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dealer-contracts")}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Dealer Contract: {contract.contractCode || contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Chi tiết hợp đồng Dealer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/dealer-contracts/${id}/edit`)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        {getStatusIcon(contract.status)}
        <span
          className={`inline-block px-3 py-1.5 text-sm font-medium rounded ${getStatusStyle(
            contract.status
          )}`}
        >
          {getStatusText(contract.status)}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Contract Details */}
        <div className="col-span-2 space-y-6">
          {/* Contract Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin hợp đồng
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Mã hợp đồng
                  </label>
                  <p className="text-sm font-mono font-medium text-gray-900 mt-1">
                    {contract.contractCode || contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Trạng thái
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {getStatusText(contract.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Dealer
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {dealerInfo?.dealerName || dealerInfo?.name || contract.dealerName || "N/A"}
                  </p>
                  {dealerInfo?.address && (
                    <p className="text-xs text-gray-500 mt-1">{dealerInfo.address}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Trạng thái ký
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {contract.isSigned ? "Đã ký" : "Chưa ký"}
                  </p>
                </div>
              </div>

              {contract.contractLink && (
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Tài liệu hợp đồng
                  </label>
                  <a
                    href={contract.contractLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline mt-1 block"
                  >
                    Xem tài liệu hợp đồng
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Contract Terms */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Điều khoản hợp đồng
            </h2>
            <div className="prose prose-sm max-w-none">
              {contract.terms ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {contract.terms}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Không có điều khoản</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Timeline
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">Ngày tạo</span>
                </div>
                <p className="text-sm text-gray-900 ml-5">
                  {formatDate(contract.createdAt || contract.createdDate || contract.created_date || contract.created_at)}
                </p>
              </div>

              {contract.effectiveDate && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">Ngày hiệu lực</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">
                    {formatDate(contract.effectiveDate)}
                  </p>
                </div>
              )}

              {contract.expirationDate && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">Ngày hết hạn</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">
                    {formatDate(contract.expirationDate)}
                  </p>
                </div>
              )}

              {(contract.signedAt || contract.signedDate || contract.signed_date || contract.signed_at) && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">Ngày ký</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">
                    {formatDate(contract.signedAt || contract.signedDate || contract.signed_date || contract.signed_at)}
                  </p>
                </div>
              )}

              {contract.updatedAt && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Cập nhật lần cuối</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-5">
                    {formatDate(contract.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contract UUID */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xs font-medium text-gray-600 mb-2">
              Contract UUID
            </h3>
            <p className="text-xs font-mono text-gray-500 break-all">
              {contract.id}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Xóa hợp đồng
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa hợp đồng{" "}
              <strong className="font-mono">
                {contract.contractCode || contract.code || `DC-${contract.id?.slice(-8).toUpperCase()}`}
              </strong>
              ? Hành động này không thể hoàn tác.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Xóa hợp đồng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerContractDetailPage;

