import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Trash2, Phone, Mail, User, UserCheck, Building } from "lucide-react";
import { Link } from "react-router-dom";
import RegisterDealerManagerForm from "../components/RegisterDealerManagerForm";
import { Modal, message } from "antd";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const RegisterDealerManagerPage = () => {
  const [dealerManagers, setDealerManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDealerManagers();
  }, [refreshKey]);

  // Expose fetchDealerManagers for manual refresh
  const refreshList = () => {
    fetchDealerManagers();
  };

  const fetchDealerManagers = async () => {
    setLoading(true);
    try {
      let managers = [];
      
      // Use getByRole endpoint with DEALER_MANAGER role (API supports: EVM_ADMIN, EVM_STAFF, DEALER_MANAGER, DEALER_STAFF)
      try {
        const response = await axiosInstance.get(endpoints.userProfile.getByRole, {
          params: { 
            role: "DEALER_MANAGER",
            isActive: true  // Only get active managers
          }
        });
        const data = response?.data?.items || response?.data || [];
        if (Array.isArray(data)) {
          managers = data;
        }
      } catch (roleError) {
        console.warn("getByRole with DEALER_MANAGER failed, trying fallback:", roleError);
        // Fallback: get all users and filter by role
        try {
          const response = await axiosInstance.get(endpoints.admin.users);
          const allUsers = response?.data?.items || response?.data || [];
          managers = allUsers.filter(
            user => {
              const userRole = user.role?.toUpperCase() || user.account?.role?.toUpperCase() || "";
              return userRole === "DEALER_MANAGER" || userRole === "DEALER";
            }
          );
        } catch (fetchError) {
          console.error("Error fetching users:", fetchError);
          message.error("Không thể tải danh sách dealer manager");
          setDealerManagers([]);
          return;
        }
      }
      
      // Filter out deleted items (soft delete)
      managers = managers.filter(manager => {
        return !manager.isDeleted && 
               manager.account?.isDeleted !== true && 
               manager.account?.isDeleted !== "true";
      });
      
      // Fetch dealer info for each manager if dealerId exists
      // Also extract email from account object if available
      if (managers.length > 0) {
        try {
          const dealersResponse = await axiosInstance.get(endpoints.admin.dealers);
          const dealers = dealersResponse?.data?.items || dealersResponse?.data || [];
          const dealersMap = new Map(dealers.map(d => [d.id, d]));
          
          managers = managers.map(manager => ({
            ...manager,
            dealer: manager.dealerId ? dealersMap.get(manager.dealerId) : null,
            // Extract email from account object if available
            email: manager.email || manager.account?.email || manager.accountEmail || null
          }));
        } catch (err) {
          console.error("Error fetching dealers:", err);
          // Still map email even if dealer fetch fails
          managers = managers.map(manager => ({
            ...manager,
            email: manager.email || manager.account?.email || manager.accountEmail || null
          }));
        }
      }
      
      setDealerManagers(managers);
    } catch (error) {
      console.error("Error fetching dealer managers:", error);
      message.error("Không thể tải danh sách dealer manager");
      setDealerManagers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter dealer managers based on search
  const filteredManagers = useMemo(() => {
    return dealerManagers.filter(manager => {
      const matchesSearch = manager.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           manager.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [dealerManagers, searchTerm]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshKey(prev => prev + 1);
    message.success("Tạo dealer manager thành công!");
  };

  const handleDelete = async (manager) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dealer manager này? Hành động này không thể hoàn tác.")) return;
    
    try {
      // DELETE /v1/UserProfile/{id}?isDeleted=true
      // Dealer manager is a UserProfile, not a Dealer
      let deleteSuccess = false;
      const managerId = manager.id;
      let accountId = manager.accountId || manager.account?.id;
      
      // If accountId is not available, fetch manager detail to get it
      if (!accountId) {
        try {
          const managerDetail = await axiosInstance.get(endpoints.userProfile.getById(managerId));
          const managerData = managerDetail?.data || managerDetail;
          accountId = managerData.accountId || managerData.account?.id;
        } catch (fetchError) {
          console.warn("Could not fetch manager detail for accountId:", fetchError);
        }
      }
      
      // Try with accountId first if available (more reliable)
      if (accountId) {
        try {
          await axiosInstance.delete(endpoints.userProfile.getById(accountId), {
            params: { isDeleted: true }
          });
          deleteSuccess = true;
        } catch (accIdError) {
          console.warn("Delete with accountId failed, trying with id:", accIdError);
          // Fall through to try with id
        }
      }
      
      // Try with id if accountId didn't work
      if (!deleteSuccess) {
        try {
          await axiosInstance.delete(endpoints.userProfile.getById(managerId), {
            params: { isDeleted: true }
          });
          deleteSuccess = true;
        } catch (idError) {
          console.error("Error deleting with id:", idError);
          throw idError;
        }
      }
      
      if (deleteSuccess) {
        message.success("Xóa dealer manager thành công");
        // Refresh the list immediately
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting dealer manager:", error);
      message.error("Không thể xóa dealer manager: " + (error?.response?.data?.message || error?.message || "Lỗi không xác định"));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Đại lý</h1>
            <p className="text-gray-600 mt-1">Quản lý tài khoản quản lý đại lý ({filteredManagers.length} quản lý)</p>
          </div>
        <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
            <Plus size={20} className="mr-2" />
            Thêm Quản lý Mới
        </button>
        </div>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm quản lý theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredManagers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <UserCheck size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Không tìm thấy quản lý" : "Chưa có quản lý đại lý"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "Thử điều chỉnh tiêu chí tìm kiếm" 
              : "Bắt đầu bằng cách thêm quản lý đại lý đầu tiên"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Thêm Quản lý Đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Managers Grid */}
      {!loading && filteredManagers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((manager) => (
            <div key={manager.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {manager.fullName ? manager.fullName.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{manager.fullName || manager.name || "Chưa có tên"}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        Quản lý Đại lý
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                {manager.dealer && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{manager.dealer.name || "Chưa có đại lý"}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>{manager.phone || "Chưa có SĐT"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{manager.email || "Chưa có email"}</span>
                </div>
                
                {manager.cardId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                    <span>CCCD: {manager.cardId}</span>
                  </div>
                )}
        </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/admin/dealer-managers/${manager.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <UserCheck size={16} className="mr-2" />
                    Xem chi tiết
                  </Link>
                  <button
                    onClick={() => handleDelete(manager)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        {/* Create Modal */}
        <Modal
          title={
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
              Tạo Dealer Manager mới
      </div>
          }
          open={showCreateModal}
          onCancel={() => setShowCreateModal(false)}
          footer={null}
          width={800}
          destroyOnClose
          style={{ top: 20 }}
          bodyStyle={{ 
            padding: '24px',
            maxHeight: 'calc(100vh - 150px)',
            overflowY: 'auto'
          }}
        >
          <RegisterDealerManagerForm onSuccess={handleCreateSuccess} />
        </Modal>
    </div>
  );
};

export default RegisterDealerManagerPage;

