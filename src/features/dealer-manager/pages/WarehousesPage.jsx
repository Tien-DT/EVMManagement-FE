import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MapPin,
  Package,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useWarehouses } from "../hooks/useWarehouses";
import AddVehiclesToWarehouseModal from "../components/AddVehiclesToWarehouseModal";

const WarehousesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dealerId, setDealerId] = useState(null);
  const [addVehiclesModalOpen, setAddVehiclesModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // Get dealerId from localStorage or context
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("❌ No user found in localStorage");
          setDealerId(null);
          return;
        }

        const user = JSON.parse(userStr);
        const accountId = user.id;

        if (!accountId) {
          console.error("❌ No accountId found in user");
          setDealerId(null);
          return;
        }

        console.log("🔍 Fetching dealerId for accountId:", accountId);

        // Import dealerService at the top if not already imported
        const { dealerService } = await import("../services/dealerService");

        // Fetch user profile to get dealerId
        const userProfile = await dealerService.getUserProfile(accountId);

        if (userProfile.success && userProfile.data?.dealerId) {
          const fetchedDealerId = userProfile.data.dealerId;
          console.log("✅ DealerId fetched from API:", fetchedDealerId);

          // Save to localStorage for future use
          localStorage.setItem(
            "userProfile",
            JSON.stringify(userProfile.data)
          );
          localStorage.setItem("dealerId", fetchedDealerId);

          setDealerId(fetchedDealerId);
        } else {
          console.error("❌ No dealerId found in user profile");
          setDealerId(null);
        }
      } catch (error) {
        console.error("❌ Error fetching dealerId:", error);
        setDealerId(null);
      }
    };

    fetchDealerId();
  }, []);

  const {
    warehouses,
    isLoading,
    error,
    pagination,
    refreshWarehouses,
    deleteWarehouse,
    changePage,
  } = useWarehouses(dealerId);

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getCapacityPercentage = (current, total) => {
    if (!total) return 0;
    return (current / total) * 100;
  };

  const getCapacityColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kho hàng này?")) {
      const result = await deleteWarehouse(id);
      if (result.success) {
        alert("Xóa kho hàng thành công!");
      } else {
        alert(`Xóa kho hàng thất bại: ${result.error}`);
      }
    }
  };

  const handleAddVehicles = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setAddVehiclesModalOpen(true);
  };

  const handleAddVehiclesSuccess = () => {
    // Refresh warehouses list
    refreshWarehouses();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách kho hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshWarehouses()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-600 mt-1">Quản lý kho hàng của dealer</p>
        </div>
        <button
          onClick={() => navigate("/dealer/warehouses/create")}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Create Warehouse</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm warehouse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">
            Total Warehouses
          </h3>
          <p className="text-3xl font-bold">
            {pagination.totalCount || warehouses.length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Total Capacity
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Current Stock
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {warehouses.reduce((sum, w) => sum + (w.vehicles?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Warehouses List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWarehouses.map((warehouse) => {
                // Count vehicles in this warehouse
                const currentStock = warehouse.vehicles?.length || 0;
                const capacityPercentage = getCapacityPercentage(
                  currentStock,
                  warehouse.capacity || 0
                );

                return (
                  <tr
                    key={warehouse.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {warehouse.name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {warehouse.type || "DEALER"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {warehouse.address || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {currentStock} / {warehouse.capacity || 0}
                          </span>
                          <span className="text-gray-500 font-medium">
                            {capacityPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor(
                              capacityPercentage
                            )}`}
                            style={{
                              width: `${Math.min(capacityPercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          warehouse.status || "active"
                        )}`}
                      >
                        {warehouse.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddVehicles(warehouse)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Thêm xe vào kho"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dealer/warehouses/${warehouse.id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/dealer/warehouses/${warehouse.id}/edit`)
                          }
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredWarehouses.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No warehouses found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first warehouse to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/dealer/warehouses/create")}
                className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
                <span>Create Warehouse</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {warehouses.length} of {pagination.totalCount} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Vehicles Modal */}
      <AddVehiclesToWarehouseModal
        isOpen={addVehiclesModalOpen}
        onClose={() => {
          setAddVehiclesModalOpen(false);
          setSelectedWarehouse(null);
        }}
        warehouseId={selectedWarehouse?.id}
        dealerId={dealerId}
        onSuccess={handleAddVehiclesSuccess}
      />
    </div>
  );
};

export default WarehousesPage;

