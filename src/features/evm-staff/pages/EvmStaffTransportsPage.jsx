import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Truck, Package, MapPin, Calendar, CheckCircle, Clock, XCircle, Eye, Edit, Trash2, Plus } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";
import CreateTransportModal from "../components/CreateTransportModal";
import UpdateTransportStatusModal from "../components/UpdateTransportStatusModal";
import AddTransportDetailsModal from "../components/AddTransportDetailsModal";

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
  const [addDetailsModalVisible, setAddDetailsModalVisible] = useState(false);
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
    // Normalize status to uppercase string for comparison
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
    
    const statusMap = {
      // Number format
      0: { text: "Chờ xử lý", color: "bg-orange-50 text-orange-700 border-orange-200" },
      1: { text: "Đang vận chuyển", color: "bg-blue-50 text-blue-700 border-blue-200" },
      2: { text: "Hoàn thành", color: "bg-green-50 text-green-700 border-green-200" },
      3: { text: "Đã hủy", color: "bg-red-50 text-red-700 border-red-200" },
      // String format
      'PENDING': { text: "Chờ xử lý", color: "bg-orange-50 text-orange-700 border-orange-200" },
      'IN_TRANSIT': { text: "Đang vận chuyển", color: "bg-blue-50 text-blue-700 border-blue-200" },
      'DELIVERED': { text: "Hoàn thành", color: "bg-green-50 text-green-700 border-green-200" },
      'CANCELED': { text: "Đã hủy", color: "bg-red-50 text-red-700 border-red-200" },
    };

    const statusInfo = statusMap[normalizedStatus] || { text: "Không xác định", color: "bg-gray-50 text-gray-700 border-gray-200" };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
    
    switch (normalizedStatus) {
      case 0:
      case 'PENDING':
        return <Clock size={16} className="text-orange-600" />;
      case 1:
      case 'IN_TRANSIT':
        return <Truck size={16} className="text-blue-600" />;
      case 2:
      case 'DELIVERED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 3:
      case 'CANCELED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
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

  // Helper function to build order update data with all non-null fields
  const buildOrderUpdateData = (order, newStatus) => {
    const updateData = {
      code: order.code,
      dealerId: order.dealerId,
      status: newStatus,
      orderType: order.orderType,
    };
    
    // Add optional fields if they exist
    if (order.customerId) updateData.customerId = order.customerId;
    if (order.quotationId) updateData.quotationId = order.quotationId;
    if (order.handoverRecordId) updateData.handoverRecordId = order.handoverRecordId;
    if (order.contractId) updateData.contractId = order.contractId;
    if (order.depositId) updateData.depositId = order.depositId;
    if (order.note) updateData.note = order.note;
    if (order.totalAmount) updateData.totalAmount = order.totalAmount;
    if (order.discount) updateData.discount = order.discount;
    if (order.finalAmount) updateData.finalAmount = order.finalAmount;
    if (order.handoverDate) updateData.handoverDate = order.handoverDate;
    
    return updateData;
  };

  // Mark transport as completed: Transport -> COMPLETED, Order -> COMPLETED
  const handleMarkAsCompleted = async (transport) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Xác nhận hoàn thành vận chuyển cho "${transport.dealerName || 'dealer'}"?\n\n` +
      `Hành động này sẽ:\n` +
      `- Cập nhật vận chuyển → Hoàn thành\n` +
      `- Cập nhật đơn hàng → Hoàn thành`
    );
    
    if (!confirmed) return;
    
    try {
      console.log("Marking transport as completed:", transport);
      
      // 1. Update transport status to COMPLETED
      const transportUpdateData = {
        providerName: transport.providerName || null,
        pickupLocation: transport.pickupLocation,
        dropoffLocation: transport.dropoffLocation,
        status: "COMPLETED",
        scheduledPickupAt: transport.scheduledPickupAt || null,
        deliveredAt: transport.deliveredAt || null,
        orderId: transport.orderId,
      };
      
      console.log("Updating transport to COMPLETED:", transportUpdateData);
      await axiosInstance.put(
        endpoints.transports.update(transport.id),
        transportUpdateData
      );
      
      // 2. Update order status to COMPLETED
      if (transport.orderId) {
        try {
          console.log("Updating order status to COMPLETED...");
          
          // Load current order data
          const orderResponse = await axiosInstance.get(
            endpoints.orders.getById(transport.orderId)
          );
          const currentOrder = orderResponse.data || orderResponse;
          
          if (currentOrder) {
            const orderUpdateData = buildOrderUpdateData(currentOrder, "COMPLETED");
            
            console.log("Order update payload:", orderUpdateData);
            await axiosInstance.put(
              endpoints.orders.update(transport.orderId),
              orderUpdateData
            );
            
            showSuccess("Đã cập nhật: Vận chuyển → Hoàn thành, Đơn hàng → Hoàn thành");
          }
        } catch (orderError) {
          console.error("Error updating order status:", orderError);
          showSuccess("Đã cập nhật vận chuyển (nhưng không thể cập nhật trạng thái đơn hàng)");
        }
      } else {
        showSuccess("Đã đánh dấu vận chuyển hoàn thành");
      }
      
      fetchTransports(); // Refresh table
    } catch (error) {
      console.error("Error marking transport as completed:", error);
      showError(error.response?.data?.message || "Không thể cập nhật trạng thái vận chuyển");
    }
  };

  // Mark transport as delivered: Transport -> DELIVERED, Order -> READY_FOR_HANDOVER
  const handleMarkAsDelivered = async (transport) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Xác nhận đã giao hàng cho "${transport.dealerName || 'dealer'}"?\n\n` +
      `Hành động này sẽ:\n` +
      `- Cập nhật vận chuyển → Hoàn thành\n` +
      `- Cập nhật đơn hàng → Sẵn sàng bàn giao`
    );
    
    if (!confirmed) return;
    
    try {
      console.log("Marking transport as delivered:", transport);
      
      // 1. Update transport status to DELIVERED
      const transportUpdateData = {
        providerName: transport.providerName || null,
        pickupLocation: transport.pickupLocation,
        dropoffLocation: transport.dropoffLocation,
        status: "DELIVERED",
        scheduledPickupAt: transport.scheduledPickupAt || null,
        deliveredAt: new Date().toISOString(), // Set delivered time
        orderId: transport.orderId,
      };
      
      console.log("Updating transport to DELIVERED:", transportUpdateData);
      await axiosInstance.put(
        endpoints.transports.update(transport.id),
        transportUpdateData
      );
      
      // 2. Update order status to READY_FOR_HANDOVER
      if (transport.orderId) {
        try {
          console.log("Updating order status to READY_FOR_HANDOVER...");
          
          // Load current order data
          const orderResponse = await axiosInstance.get(
            endpoints.orders.getById(transport.orderId)
          );
          const currentOrder = orderResponse.data || orderResponse;
          
          if (currentOrder) {
            const orderUpdateData = buildOrderUpdateData(currentOrder, "READY_FOR_HANDOVER");
            
            console.log("Order update payload:", orderUpdateData);
            await axiosInstance.put(
              endpoints.orders.update(transport.orderId),
              orderUpdateData
            );
            
            showSuccess("Đã cập nhật: Vận chuyển → Hoàn thành, Đơn hàng → Sẵn sàng bàn giao");
          }
        } catch (orderError) {
          console.error("Error updating order status:", orderError);
          showSuccess("Đã cập nhật vận chuyển (nhưng không thể cập nhật trạng thái đơn hàng)");
        }
      } else {
        showSuccess("Đã đánh dấu vận chuyển hoàn thành");
      }
      
      fetchTransports(); // Refresh table
    } catch (error) {
      console.error("Error marking transport as delivered:", error);
      showError(error.response?.data?.message || "Không thể cập nhật trạng thái vận chuyển");
    }
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
                {transports.filter((t) => t.status === 0 || t.status === 'PENDING' || t.status?.toUpperCase() === 'PENDING').length}
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
                {transports.filter((t) => t.status === 1 || t.status === 'IN_TRANSIT' || t.status?.toUpperCase() === 'IN_TRANSIT').length}
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
                {transports.filter((t) => t.status === 2 || t.status === 'DELIVERED' || t.status?.toUpperCase() === 'DELIVERED').length}
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
                      {/* Show Add Details button only for PENDING status (status = 0 or "PENDING") */}
                      {(transport.status === 0 || transport.status === 'PENDING' || transport.status?.toUpperCase() === 'PENDING') && (
                        <button
                          onClick={() => {
                            setSelectedTransport(transport);
                            setAddDetailsModalVisible(true);
                          }}
                          className="text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors"
                          title="Thêm xe vào vận chuyển"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      {/* Show Delivered button only for IN_TRANSIT status */}
                      {(transport.status === 1 || transport.status === 'IN_TRANSIT' || transport.status?.toUpperCase() === 'IN_TRANSIT') && (
                        <button
                          onClick={() => handleMarkAsDelivered(transport)}
                          className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-md transition-colors"
                          title="Đánh dấu đã giao hàng"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
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

      {/* Add Transport Details Modal */}
      <AddTransportDetailsModal
        visible={addDetailsModalVisible}
        onClose={() => {
          setAddDetailsModalVisible(false);
          setSelectedTransport(null);
        }}
        transport={selectedTransport}
        onSuccess={() => {
          setAddDetailsModalVisible(false);
          setSelectedTransport(null);
          fetchTransports();
        }}
      />
    </div>
  );
};

export default EvmStaffTransportsPage;

