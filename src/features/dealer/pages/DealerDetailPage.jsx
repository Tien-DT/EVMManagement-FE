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

        // Fetch users/managers for this dealer
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
          {error ? error.message : "Dealer not found"}
        </div>
        <button
          onClick={() => navigate("/admin/dealers")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Dealers
        </button>
      </div>
    );
  }

  const dealerManagers = managers.filter(m => m.role === "DEALER_MANAGER");
  const dealerStaff = managers.filter(m => m.role === "DEALER_STAFF");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/dealers")}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dealers</span>
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
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="mr-1" />
                        Inactive
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
              Edit Dealer
            </Link>
          </div>
        </div>

        {/* Dealer Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dealer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <MapPin size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="text-gray-900 mt-1">{dealer.address || "No address"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Phone size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="text-gray-900 mt-1">{dealer.phone || "No phone"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Mail size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 mt-1">{dealer.email || "No email"}</div>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar size={20} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500">Established Date</div>
                <div className="text-gray-900 mt-1">
                  {dealer.establishedAt 
                    ? new Date(dealer.establishedAt).toLocaleDateString() 
                    : "Not established"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dealer Managers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserCog className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">
              Dealer Managers ({dealerManagers.length})
            </h2>
          </div>

          {dealerManagers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCog size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No dealer managers registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dealerManagers.map((manager) => (
                <div key={manager.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{manager.fullName || manager.name}</div>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {manager.email && (
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {manager.email}
                          </div>
                        )}
                        {manager.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {manager.phone}
                          </div>
                        )}
                        {manager.cardId && (
                          <div className="text-xs text-gray-500">
                            CCCD/CMND: {manager.cardId}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Manager
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dealer Staff */}
        {dealerStaff.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-gray-600" size={24} />
              <h2 className="text-lg font-semibold text-gray-900">
                Dealer Staff ({dealerStaff.length})
              </h2>
            </div>

            <div className="space-y-3">
              {dealerStaff.map((staff) => (
                <div key={staff.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{staff.fullName || staff.name}</div>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {staff.email && (
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {staff.email}
                          </div>
                        )}
                        {staff.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {staff.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Staff
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

