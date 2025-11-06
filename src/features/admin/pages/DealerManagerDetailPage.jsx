import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  UserCheck, 
  Phone, 
  Mail,
  Edit3,
  CreditCard,
  Calendar,
  User,
  Building,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { message, Popconfirm, Modal } from "antd";
import EditDealerManagerForm from "../components/EditDealerManagerForm";

export default function DealerManagerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchManagerDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(endpoints.userProfile.getById(id));
        const managerData = response?.data || response;
        
        // Extract email from account object if available
        const managerWithEmail = {
          ...managerData,
          email: managerData.email || managerData.account?.email || managerData.accountEmail || null
        };
        
        setManager(managerWithEmail);
        
        // Fetch dealer info if dealerId exists
        if (managerData.dealerId) {
          try {
            const dealerResponse = await axiosInstance.get(endpoints.admin.dealers);
            const dealers = dealerResponse?.data?.items || dealerResponse?.data || [];
            const dealer = dealers.find(d => d.id === managerData.dealerId);
            if (dealer) {
              setManager(prev => ({ ...prev, dealer }));
            }
          } catch (err) {
            console.error("Error fetching dealer:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching manager:", err);
        setError(err);
        message.error("Không thể tải thông tin dealer manager");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchManagerDetails();
    }
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // DELETE /v1/UserProfile/{id}?isDeleted=true
      // Dealer manager is a UserProfile, not a Dealer
      let deleteSuccess = false;
      const managerId = id;
      const accountId = manager?.accountId || manager?.account?.id;
      
      // Try with id first
      try {
        await axiosInstance.delete(endpoints.userProfile.getById(managerId), {
          params: { isDeleted: true }
        });
        deleteSuccess = true;
      } catch (idError) {
        // If 404 with id, try with accountId
        if (idError?.response?.status === 404 && accountId) {
          try {
            await axiosInstance.delete(endpoints.userProfile.getById(accountId), {
              params: { isDeleted: true }
            });
            deleteSuccess = true;
          } catch (accIdError) {
            console.error("Error deleting with accountId:", accIdError);
            throw accIdError;
          }
        } else {
          throw idError;
        }
      }
      
      if (deleteSuccess) {
        message.success("Xóa dealer manager thành công");
        navigate("/admin/register-dealer-manager");
      }
    } catch (error) {
      console.error("Error deleting manager:", error);
      message.error("Không thể xóa dealer manager: " + (error?.response?.data?.message || error?.message || "Lỗi không xác định"));
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    message.success("Cập nhật dealer manager thành công");
    // Refresh manager data
    try {
      const response = await axiosInstance.get(endpoints.userProfile.getById(id));
      const managerData = response?.data || response;
      setManager(managerData);
      
      // Fetch dealer info if dealerId exists
      if (managerData.dealerId) {
        try {
          const dealerResponse = await axiosInstance.get(endpoints.admin.dealers);
          const dealers = dealerResponse?.data?.items || dealerResponse?.data || [];
          const dealer = dealers.find(d => d.id === managerData.dealerId);
          if (dealer) {
            setManager(prev => ({ ...prev, dealer }));
          }
        } catch (err) {
          console.error("Error fetching dealer:", err);
        }
      }
    } catch (err) {
      console.error("Error refreshing manager:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error?.message || "Không tìm thấy dealer manager"}</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/register-dealer-manager")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/register-dealer-manager")}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại danh sách</span>
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {manager.fullName ? manager.fullName.charAt(0).toUpperCase() : 'D'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{manager.fullName || manager.name || "No name"}</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                    <UserCheck size={14} className="mr-1" />
                    Dealer Manager
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                <Edit3 size={16} className="mr-2" />
                Chỉnh sửa
              </button>
              <Popconfirm
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa dealer manager này?"
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: deleting }}
              >
                <button
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
                >
                  <Trash2 size={16} className="mr-2" />
                  Xóa
                </button>
              </Popconfirm>
            </div>
          </div>
        </div>

        {/* Manager Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Dealer Manager</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <User size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Họ và tên</div>
                <div className="text-gray-900 mt-1 font-medium">{manager.fullName || manager.name || "No name"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Phone size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Số điện thoại</div>
                <div className="text-gray-900 mt-1">{manager.phone || "No phone"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Mail size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 mt-1">{manager.email || "No email"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">CCCD/CMND</div>
                <div className="text-gray-900 mt-1">{manager.cardId || "No ID"}</div>
              </div>
            </div>

            {manager.dealer && (
              <div className="flex items-start md:col-span-2">
                <Building size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Dealer</div>
                  <div className="text-gray-900 mt-1 font-medium">{manager.dealer.name || "No dealer"}</div>
                  {manager.dealer.code && (
                    <div className="text-xs text-gray-500 mt-1">Mã: {manager.dealer.code}</div>
                  )}
                </div>
              </div>
            )}

            {manager.createdAt && (
              <div className="flex items-start">
                <Calendar size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Ngày tạo</div>
                  <div className="text-gray-900 mt-1">
                    {new Date(manager.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            )}

            {manager.accountId && (
              <div className="flex items-start">
                <User size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Account ID</div>
                  <div className="text-gray-900 mt-1 font-mono text-xs">{manager.accountId}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 mt-2"></div>
              <div>
                <div className="text-sm text-gray-500">Manager ID</div>
                <div className="text-gray-900 mt-1 font-mono text-xs">{manager.id}</div>
              </div>
            </div>

            {manager.role && (
              <div className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <div className="text-sm text-gray-500">Role</div>
                  <div className="text-gray-900 mt-1">{manager.role}</div>
                </div>
              </div>
            )}

            {manager.dealerId && (
              <div className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <div className="text-sm text-gray-500">Dealer ID</div>
                  <div className="text-gray-900 mt-1 font-mono text-xs">{manager.dealerId}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
            Chỉnh sửa Dealer Manager
          </div>
        }
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
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
        <EditDealerManagerForm 
          manager={manager} 
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
}

