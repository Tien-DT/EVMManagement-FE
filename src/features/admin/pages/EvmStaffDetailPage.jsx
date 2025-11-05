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
  User
} from "lucide-react";
import evmStaffService from "../services/evmStaffService";

export default function EvmStaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const staffRes = await evmStaffService.getById(id);
        const staffData = staffRes?.data || staffRes;
        // Email có thể ở trong account object hoặc trực tiếp trong staffData
        // Đảm bảo email được hiển thị đúng
        const email = staffData.account?.email || staffData.email;
        if (email) {
          staffData.email = email;
        }
        console.log("📧 [EVM STAFF DETAIL] Data from BE:", {
          staffData,
          account: staffData.account,
          email: staffData.email,
          hasAccount: !!staffData.account
        });
        setStaff(staffData);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error ? error.message : "Staff member not found"}
        </div>
        <button
          onClick={() => navigate("/admin/evm-staff")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to EVM Staff
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/evm-staff")}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to EVM Staff</span>
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : 'E'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{staff.fullName || "No name"}</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                    <UserCheck size={14} className="mr-1" />
                    EVM Staff
                  </span>
                </div>
              </div>
            </div>
            <Link
              to={`/admin/evm-staff/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              <Edit3 size={16} className="mr-2" />
              Edit Staff
            </Link>
          </div>
        </div>

        {/* Staff Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <User size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Full Name</div>
                <div className="text-gray-900 mt-1 font-medium">{staff.fullName || "No name"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Phone size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="text-gray-900 mt-1">{staff.phone || "No phone"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Mail size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 mt-1">{staff.email || "No email"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">CCCD/CMND</div>
                <div className="text-gray-900 mt-1">{staff.cardId || "No ID"}</div>
              </div>
            </div>

            {staff.createdAt && (
              <div className="flex items-start">
                <Calendar size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Created Date</div>
                  <div className="text-gray-900 mt-1">
                    {new Date(staff.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {staff.accountId && (
              <div className="flex items-start">
                <User size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Account ID</div>
                  <div className="text-gray-900 mt-1 font-mono text-xs">{staff.accountId}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 mt-2"></div>
              <div>
                <div className="text-sm text-gray-500">Staff ID</div>
                <div className="text-gray-900 mt-1 font-mono text-xs">{staff.id}</div>
              </div>
            </div>

            {staff.role && (
              <div className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <div className="text-sm text-gray-500">Role</div>
                  <div className="text-gray-900 mt-1">{staff.role}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

