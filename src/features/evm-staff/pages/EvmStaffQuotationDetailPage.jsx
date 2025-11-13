import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  AlertCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Send,
  ShoppingCart,
} from "lucide-react";
import useQuotations from "../hooks/useQuotations";
import useQuotationDetails from "../hooks/useQuotationDetails";
import { useNotification } from "../../../context/NotificationContext";

const EvmStaffQuotationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const { getQuotationById, deleteQuotation } = useQuotations();
  const { fetchQuotationDetailsByQuotationId } = useQuotationDetails();

  const [quotation, setQuotation] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotationData = async () => {
      setLoading(true);
      try {
        console.log("📋 [QUOTATION] Loading quotation:", id);

        // Fetch quotation
        const quotationResponse = await getQuotationById(id);
        console.log("📋 [QUOTATION] Response:", quotationResponse);

        // quotationService.getQuotationById returns the data directly (axiosInstance already extracts response.data)
        // It could be the quotation object directly, or wrapped in a data property
        const quotationData = quotationResponse?.data || quotationResponse;
        console.log("📋 [QUOTATION] Processed data:", quotationData);
        setQuotation(quotationData);

        // Check if quotationDetails are already in the quotation object
        if (quotationData?.quotationDetails && Array.isArray(quotationData.quotationDetails) && quotationData.quotationDetails.length > 0) {
          console.log("📋 [QUOTATION DETAILS] Found in quotation object:", quotationData.quotationDetails);
          setQuotationDetails(quotationData.quotationDetails);
        } else {
          // Fetch quotation details separately if not included
          const detailsData = await fetchQuotationDetailsByQuotationId(id);
          console.log("📋 [QUOTATION DETAILS] Fetched:", detailsData);
          // Hook already returns the processed array
          setQuotationDetails(Array.isArray(detailsData) ? detailsData : []);
        }
      } catch (error) {
        console.error("❌ [QUOTATION] Error:", error);
        showError("Không thể tải thông tin báo giá");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadQuotationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id to avoid infinite loop

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-300";
      case "EXPIRED":
        return "bg-orange-50 text-orange-700 border-orange-300";
      case "CONVERTED_TO_ORDER":
        return "bg-cyan-50 text-cyan-700 border-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case "DRAFT":
        return <FileText size={24} />;
      case "SENT":
        return <Send size={24} />;
      case "APPROVED":
        return <CheckCircle size={24} />;
      case "ACCEPTED":
        return <CheckCircle size={24} />;
      case "REJECTED":
        return <XCircle size={24} />;
      case "EXPIRED":
        return <AlertCircle size={24} />;
      case "CONVERTED_TO_ORDER":
        return <ShoppingCart size={24} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case "DRAFT":
        return "Bản nháp";
      case "SENT":
        return "Đã gửi";
      case "APPROVED":
        return "Đã duyệt";
      case "ACCEPTED":
        return "Đã chấp nhận";
      case "REJECTED":
        return "Bị từ chối";
      case "EXPIRED":
        return "Hết hạn";
      case "CONVERTED_TO_ORDER":
        return "Đã chuyển thành đơn hàng";
      default:
        return "Không xác định";
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa báo giá này?")) {
      try {
        await deleteQuotation(id);
        showSuccess("Xóa báo giá thành công!");
        navigate("/evm-staff/quotations");
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa báo giá");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/evm-staff/quotations/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Không tìm thấy báo giá
          </h3>
          <p className="text-gray-600 mb-6">
            Báo giá này không tồn tại hoặc đã bị xóa
          </p>
          <button
            onClick={() => navigate("/evm-staff/quotations")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 animate-slideIn">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/evm-staff/quotations")}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Chi tiết báo giá
              </h1>
              <p className="text-gray-600 mt-2">
                Mã:{" "}
                <span className="font-bold text-gray-900">
                  {quotation.code || quotation.id}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 animate-scaleIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Trạng thái báo giá
              </h3>
              <div
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-base font-bold border-2 ${getStatusColor(
                  quotation.status
                )}`}
              >
                {getStatusIcon(quotation.status)}
                <span>{getStatusText(quotation.status)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 mb-2">Ngày tạo</p>
              <div className="flex items-center gap-2 text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                <Calendar size={20} className="text-blue-600" />
                <span className="font-bold">
                  {quotation.createdDate || quotation.createdAt
                    ? new Date(quotation.createdDate || quotation.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 animate-scaleIn hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <User size={24} className="text-white" />
              </div>
              Thông tin khách hàng
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <User size={18} className="text-purple-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">
                    Tên khách hàng
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {quotation.customerName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Mail size={18} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-bold text-gray-900">
                    {quotation.customerEmail || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dealer Info */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 animate-scaleIn hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building size={24} className="text-white" />
              </div>
              Thông tin đại lý
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Building size={18} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">
                    Tên đại lý
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {quotation.dealerName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                <Mail size={18} className="text-indigo-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-bold text-gray-900">
                    {quotation.dealerEmail || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Details Items */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 animate-scaleIn hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart size={24} className="text-white" />
            </div>
            Danh sách xe
            {quotationDetails.length > 0 && (
              <span className="ml-auto text-sm font-medium text-gray-500">
                ({quotationDetails.length} sản phẩm)
              </span>
            )}
          </h3>

          {quotationDetails && quotationDetails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Xe
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                      Giảm giá
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotationDetails.map((detail, index) => {
                    const subtotal =
                      (detail.unitPrice || 0) * (detail.quantity || 0);
                    const discount =
                      subtotal * ((detail.discountPercent || 0) / 100);
                    const total = subtotal - discount;

                    return (
                      <tr
                        key={detail.id || index}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                              <Car size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {detail.vehicleModelName || "N/A"}
                              </p>
                              {detail.vehicleVariantColor && (
                                <p className="text-xs text-gray-600 font-medium">
                                  Màu: {detail.vehicleVariantColor}
                                </p>
                              )}
                              {detail.note && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {detail.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                            {detail.quantity || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(detail.unitPrice || 0)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            {detail.discountPercent || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-emerald-600">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Không có chi tiết báo giá</p>
              <p className="text-sm">Chưa có sản phẩm nào trong báo giá này</p>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl border-2 border-emerald-200 p-8 animate-scaleIn">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign size={24} className="text-white" />
            </div>
            Tổng quan thanh toán
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-xl">
              <span className="text-gray-700 font-medium">Tổng giá trị:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(quotation.subtotal || quotation.totalValue || 0)}
              </span>
            </div>
            {quotation.tax && quotation.tax > 0 && (
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <span className="text-gray-700 font-medium">Thuế (VAT):</span>
                <span className="font-bold text-blue-900">
                  {formatCurrency(quotation.tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
              <span className="text-xl font-bold text-white">Thành tiền:</span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(quotation.total || quotation.totalValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Có hiệu lực đến:
                </span>
              </div>
              <span className="font-bold text-blue-900">
                {quotation.validUntil
                  ? new Date(quotation.validUntil).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {quotation.note && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText size={24} className="text-white" />
              </div>
              Ghi chú
            </h3>
            <div className="p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-600" />
                Thông tin bổ sung:
              </p>
              <p className="text-gray-900 whitespace-pre-wrap">
                {quotation.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvmStaffQuotationDetailPage;
