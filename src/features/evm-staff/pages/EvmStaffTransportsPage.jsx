import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Truck, Package, MapPin, Calendar, CheckCircle, Clock, XCircle, Eye, Edit, Trash2, Plus } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";
import CreateTransportModal from "../components/CreateTransportModal";
import UpdateTransportStatusModal from "../components/UpdateTransportStatusModal";

const EvmStaffTransportsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [preselectedOrderId, setPreselectedOrderId] = useState(null);

  // Check for orderId in URL params and auto-open create modal
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      console.log('Opening create transport modal with preselected order:', orderId);
      setPreselectedOrderId(orderId);
      setCreateModalVisible(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTransports();
  }, [pagination.current, pagination.pageSize]);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.transports.getAll, {
        params: {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
        },
      });

      if (response.data?.items) {
        setTransports(response.data.items);
        setPagination((prev) => ({
          ...prev,
          total: response.data.totalCount,
        }));
      }
    } catch (error) {
      showError("Không thể tải danh sách vận chuyển");
      console.error("Error fetching transports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: "Chờ xử lý", color: "bg-orange-50 text-orange-700 border-orange-200" },
      1: { text: "Đang vận chuyển", color: "bg-blue-50 text-blue-700 border-blue-200" },
      2: { text: "Hoàn thành", color: "bg-green-50 text-green-700 border-green-200" },
      3: { text: "Đã hủy", color: "bg-red-50 text-red-700 border-red-200" },
    };

    const statusInfo = statusMap[status] || { text: "Không xác định", color: "bg-gray-50 text-gray-700 border-gray-200" };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <Clock size={16} className="text-orange-600" />;
      case 1: return <Truck size={16} className="text-blue-600" />;
      case 2: return <CheckCircle size={16} className="text-green-600" />;
      case 3: return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý vận chuyển</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi và quản lý các chuyến vận chuyển xe</p>
        </div>
        <button
          onClick={() => setCreateModalVisible(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo vận chuyển
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chờ xử lý</p>
              <p className="text-xl font-bold text-gray-900">
                {transports.filter((t) => t.status === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đang vận chuyển</p>
              <p className="text-xl font-bold text-gray-900">
                {transports.filter((t) => t.status === 1).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-xl font-bold text-gray-900">
                {transports.filter((t) => t.status === 2).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package size={20} className="text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng số</p>
              <p className="text-xl font-bold text-gray-900">{transports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transports Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đại lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhà cung cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm lấy/giao
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian lấy hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transports.map((transport) => (
                <tr key={transport.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {transport.dealerName || "N/A"}
                      </div>
                      {transport.dealerAddress && (
                        <div className="text-gray-500 text-xs mt-1">
                          {transport.dealerAddress}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {transport.providerName || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-green-600 mr-1" />
                        <span className="font-medium">Lấy:</span>
                        <span className="ml-1">{transport.pickupLocation || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="text-red-600 mr-1" />
                        <span className="font-medium">Giao:</span>
                        <span className="ml-1">{transport.dropoffLocation || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transport.status)}
                      {getStatusBadge(transport.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar size={14} className="text-gray-400 mr-2" />
                      {formatDate(transport.scheduledPickupAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package size={14} className="text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {transport.transportDetails?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(transport.createdDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTransport(transport);
                          setUpdateModalVisible(true);
                        }}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                        title="Cập nhật"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(pagination.current - 1) * pagination.pageSize + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                </span>{" "}
                trong tổng số <span className="font-medium">{pagination.total}</span> kết quả
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, current: prev.current - 1 }))
                  }
                  disabled={pagination.current === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, current: prev.current + 1 }))
                  }
                  disabled={pagination.current * pagination.pageSize >= pagination.total}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && transports.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Truck size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có vận chuyển nào</h3>
          <p className="text-gray-600">Các vận chuyển sẽ được hiển thị ở đây</p>
        </div>
      )}

      {/* Create Transport Modal */}
      <CreateTransportModal
        visible={createModalVisible}
        preselectedOrderId={preselectedOrderId}
        onClose={() => {
          setCreateModalVisible(false);
          setPreselectedOrderId(null);
          // Clear orderId from URL params
          navigate('/evm-staff/transports', { replace: true });
        }}
        onSuccess={() => {
          setCreateModalVisible(false);
          setPreselectedOrderId(null);
          fetchTransports();
          // Clear orderId from URL params
          navigate('/evm-staff/transports', { replace: true });
        }}
      />

      {/* Update Transport Status Modal */}
      <UpdateTransportStatusModal
        visible={updateModalVisible}
        onClose={() => {
          setUpdateModalVisible(false);
          setSelectedTransport(null);
        }}
        transport={selectedTransport}
        onSuccess={() => {
          setUpdateModalVisible(false);
          setSelectedTransport(null);
          fetchTransports();
        }}
      />
    </div>
  );
};

export default EvmStaffTransportsPage;

