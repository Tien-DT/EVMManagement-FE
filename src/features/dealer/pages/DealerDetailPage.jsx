import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Edit3,
  UserCog,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react";
import dealerService from "../services/dealerService";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export default function DealerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [managers, setManagers] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDealerDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dealer info
        const dealerRes = await dealerService.getById(id);
        const dealerData = dealerRes?.data || dealerRes;
        setDealer(dealerData);

        // Fetch user profiles for this dealer (from API in image 19)
        try {
          const profilesRes = await axiosInstance.get(
            `${endpoints.userProfile.getByDealer(id)}?pageNumber=1&pageSize=100`
          );
          const profiles = profilesRes?.data?.items || profilesRes?.data?.data?.items || [];
          setUserProfiles(profiles);
        } catch (err) {
          console.error("Error fetching user profiles:", err);
          setUserProfiles([]);
        }

        // Fetch users/managers for this dealer (legacy code kept for compatibility)
        try {
          const usersRes = await axiosInstance.get(`${endpoints.admin.users}`);
          const allUsers = usersRes?.data?.items || usersRes?.data || [];
          
          // Filter users by dealerId and role
          const dealerManagers = allUsers.filter(
            user => user.dealerId === id && (user.role === "DEALER_MANAGER" || user.role === "DEALER_STAFF")
          );
          setManagers(dealerManagers);
        } catch (err) {
          console.error("Error fetching users:", err);
          // If endpoint doesn't exist or fails, continue without managers
          setManagers([]);
        }
      } catch (err) {
        console.error("Error fetching dealer:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDealerDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error ? error.message : "Không tìm thấy đại lý"}
        </div>
        <button
          onClick={() => navigate("/admin/dealers")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại danh sách đại lý
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/dealers")}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại danh sách đại lý</span>
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-blue-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{dealer.name}</h1>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    dealer.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {dealer.isActive ? (
                      <>
                        <CheckCircle size={14} className="mr-1" />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="mr-1" />
                        Không hoạt động
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <Link
              to={`/admin/dealers/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              <Edit3 size={16} className="mr-2" />
              Chỉnh sửa đại lý
            </Link>
          </div>
        </div>

        {/* Dealer Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đại lý</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <MapPin size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Địa chỉ</div>
                <div className="text-gray-900 mt-1">{dealer.address || "Chưa có địa chỉ"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Phone size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Số điện thoại</div>
                <div className="text-gray-900 mt-1">{dealer.phone || "Chưa có số điện thoại"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Mail size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 mt-1">{dealer.email || "Chưa có email"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hồ sơ tài khoản đại lý */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserCog className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">
              Hồ sơ tài khoản ({userProfiles.length})
            </h2>
          </div>

          {userProfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCog size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Chưa có hồ sơ tài khoản nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userProfiles.map((profile) => (
                <div key={profile.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{profile.fullName}</div>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {profile.account?.email && (
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {profile.account.email}
                          </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {profile.phone}
                          </div>
                        )}
                        {profile.cardId && (
                          <div className="text-xs text-gray-500">
                            CCCD/CMND: {profile.cardId}
                          </div>
                        )}
                        {profile.createdDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-2 text-gray-400" />
                            Ngày tạo: {new Date(profile.createdDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {profile.account?.role && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.account.role === 'DEALER_MANAGER' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.account.role === 'DEALER_MANAGER' ? 'Quản lý' : 
                           profile.account.role === 'DEALER_STAFF' ? 'Nhân viên' : profile.account.role}
                        </span>
                      )}
                      {profile.account?.isActive !== undefined && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.account.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {profile.account.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

