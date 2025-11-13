import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Trash2, Phone, Mail, User, UserCheck } from "lucide-react";
import RegisterStaffForm from "../components/RegisterStaffForm";
import { Modal, message } from "antd";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useAuth } from "../../../context/AuthContext";
import { dealerService } from "../services/dealerService";

const RegisterStaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dealerId, setDealerId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDealerId();
  }, []);

  useEffect(() => {
    if (dealerId) {
      fetchStaff();
    }
  }, [refreshKey, dealerId]);

  const fetchDealerId = async () => {
    try {
      const userProfile = await dealerService.getUserProfile(user.id);
      const id = userProfile.data?.dealerId;
      setDealerId(id);
    } catch (error) {
      console.error("Error fetching dealer ID:", error);
      message.error("Không thể tải thông tin dealer");
    }
  };

  const fetchStaff = async () => {
    if (!dealerId) return;
    
    setLoading(true);
    try {
      let staff = [];
      
      // Use getByDealer endpoint to get staff for this dealer
      try {
        const response = await axiosInstance.get(endpoints.userProfile.getByDealer(dealerId));
        const data = response?.data?.items || response?.data || [];
        if (Array.isArray(data)) {
          staff = data;
        }
      } catch (dealerError) {
        console.warn("getByDealer failed, trying getByRole:", dealerError);
        // Fallback: use getByRole with DEALER_STAFF and filter by dealerId
        try {
          const response = await axiosInstance.get(endpoints.userProfile.getByRole, {
            params: { 
              role: "DEALER_STAFF",
              isActive: true
            }
          });
          const allStaff = response?.data?.items || response?.data || [];
          staff = allStaff.filter(s => s.dealerId === dealerId);
        } catch (roleError) {
          console.error("Error fetching staff:", roleError);
          message.error("Không thể tải danh sách nhân viên");
          setStaffList([]);
          return;
        }
      }
      
      // Filter out deleted items (soft delete)
      staff = staff.filter(s => {
        return !s.isDeleted && 
               s.account?.isDeleted !== true && 
               s.account?.isDeleted !== "true";
      });
      
      // Extract email from account object if available
      staff = staff.map(s => ({
        ...s,
        email: s.email || s.account?.email || s.accountEmail || null
      }));
      
      setStaffList(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      message.error("Không thể tải danh sách nhân viên");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter staff based on search
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesSearch = staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [staffList, searchTerm]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshKey(prev => prev + 1);
    message.success("Tạo nhân viên thành công!");
  };

  const handleDelete = async (staff) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.")) return;
    
    try {
      // DELETE /v1/UserProfile/{id}?isDeleted=true
      let deleteSuccess = false;
      const staffId = staff.id;
      let accountId = staff.accountId || staff.account?.id;
      
      // If accountId is not available, fetch staff detail to get it
      if (!accountId) {
        try {
          const staffDetail = await axiosInstance.get(endpoints.userProfile.getById(staffId));
          const staffData = staffDetail?.data || staffDetail;
          accountId = staffData.accountId || staffData.account?.id;
        } catch (fetchError) {
          console.warn("Could not fetch staff detail for accountId:", fetchError);
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
          await axiosInstance.delete(endpoints.userProfile.getById(staffId), {
            params: { isDeleted: true }
          });
          deleteSuccess = true;
        } catch (idError) {
          console.error("Error deleting with id:", idError);
          throw idError;
        }
      }
      
      if (deleteSuccess) {
        message.success("Xóa nhân viên thành công");
        // Refresh the list immediately
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      message.error("Không thể xóa nhân viên: " + (error?.response?.data?.message || error?.message || "Lỗi không xác định"));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nhân viên</h1>
            <p className="text-gray-600 mt-1">Quản lý tài khoản nhân viên của bạn ({filteredStaff.length} nhân viên)</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-lg hover:from-blue-700 hover:to-cyan-800 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <Plus size={20} className="mr-2" />
            Thêm nhân viên
          </button>
        </div>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStaff.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <UserCheck size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Không tìm thấy nhân viên" : "Chưa có nhân viên nào"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "Thử điều chỉnh tiêu chí tìm kiếm" 
              : "Bắt đầu bằng cách thêm nhân viên đầu tiên"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Thêm nhân viên đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Staff Grid */}
      {!loading && filteredStaff.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <div key={staff.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{staff.fullName || staff.name || "Không có tên"}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nhân viên
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>{staff.phone || "Không có số điện thoại"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{staff.email || "Không có email"}</span>
                </div>
                
                {staff.cardId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                    <span>CCCD: {staff.cardId}</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDelete(staff)}
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
            Tạo nhân viên mới
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
        <RegisterStaffForm 
          onSuccess={handleCreateSuccess} 
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default RegisterStaffPage;
