import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, UserCheck, Phone, Mail, User, CreditCard, Lock } from "lucide-react";
import evmStaffService from "../services/evmStaffService";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";
import { useNotification } from "../../../context/NotificationContext";

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  cardId: "",
  password: "",
};

const emptyOriginal = {
  fullName: "",
  phone: "",
  email: "",
  cardId: "",
};

export default function EvmStaffFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showSuccess, showError } = useNotification();

  const [form, setForm] = useState(emptyForm);
  const [originalForm, setOriginalForm] = useState(emptyOriginal); // Lưu dữ liệu gốc để so sánh
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const res = await evmStaffService.getById(id);
        const data = res?.data || res;
        
        // Extract email from account object if available
        const email = data.email || data.account?.email || data.accountEmail || "";
        
        // Lấy accountId để dùng cho PATCH request
        const accId = data.accountId || data.account?.id || null;
        setAccountId(accId);
        
        const initialData = {
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: email,
          cardId: data.cardId || "",
        };
        
        setForm({
          ...initialData,
          password: "", // Don't load password when editing
        });
        
        // Lưu dữ liệu gốc để so sánh khi submit
        setOriginalForm(initialData);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        // Update existing staff - sử dụng PATCH với accountId
        // PATCH method: CHỈ gửi các field đã thay đổi
        const payload = {};
        
        if (form.fullName.trim() !== originalForm.fullName) {
          payload.fullName = form.fullName.trim();
        }
        if (form.phone.trim() !== originalForm.phone) {
          payload.phone = form.phone.trim();
        }
        if (form.cardId.trim() !== originalForm.cardId) {
          payload.cardId = form.cardId.trim();
        }
        if (form.email.trim() !== originalForm.email) {
          payload.email = form.email.trim();
        }
        
        // Kiểm tra xem có field nào thay đổi không
        if (Object.keys(payload).length === 0) {
          showError("No changes detected");
          setLoading(false);
          return;
        }
        
        // Theo API docs: PATCH /v1/UserProfile/{accId} - phải dùng Account ID
        if (accountId) {
          // Use PATCH with accId (correct API endpoint)
          try {
            await axiosInstance.patch(endpoints.userProfile.updateByAccount(accountId), payload);
          } catch (patchError) {
            // Fallback to updateByAccountId if method exists
            if (evmStaffService.updateByAccountId) {
              await evmStaffService.updateByAccountId(accountId, payload);
            } else {
              throw patchError;
            }
          }
        } else {
          // Fallback: try to get accountId from staff data
          try {
            const staffRes = await evmStaffService.getById(id);
            const staffData = staffRes?.data || staffRes;
            const fetchedAccountId = staffData.accountId || staffData.account?.id;
            
            if (fetchedAccountId) {
              await axiosInstance.patch(endpoints.userProfile.updateByAccount(fetchedAccountId), payload);
            } else {
              // Final fallback to PUT with id
              const fallbackPayload = { ...form };
              delete fallbackPayload.password;
              await evmStaffService.update(id, fallbackPayload);
            }
          } catch (updateError) {
            // Final fallback to original update method
            const fallbackPayload = { ...form };
            delete fallbackPayload.password;
            await evmStaffService.update(id, fallbackPayload);
          }
        }
        showSuccess("EVM Staff updated successfully!");
      } else {
        // Register new staff with account creation
        const payload = {
          ...form,
          role: "EVM_STAFF"
        };
        console.log("🎯 Registering new EVM Staff:", payload);
        // Use auth signup endpoint to create account + user profile
        await axiosInstance.post(endpoints.auth.signup, payload);
        showSuccess("EVM Staff registered successfully!");
      }
      navigate("/admin/evm-staff");
    } catch (e) {
      console.error("❌ Error:", e);
      const errorMsg = e.message || "An error occurred";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to EVM Staff
          </button>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <UserCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? "Edit EVM Staff" : "Add New EVM Staff"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit ? "Update staff member information" : "Create a new EVM staff member"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
            <X size={20} className="mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Error</h4>
              <p className="text-sm mt-1">{String(error.message || error)}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input 
                      name="fullName" 
                      value={form.fullName} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                      placeholder="Enter full name"
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CreditCard size={16} className="mr-2" />
                      CCCD/CMND *
                    </label>
                    <input 
                      name="cardId" 
                      value={form.cardId} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                      placeholder="Enter ID card number"
                      required
                    />
                  </div>

                  {!isEdit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Lock size={16} className="mr-2" />
                        Password *
                      </label>
                      <input 
                        type="password"
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                        placeholder="Enter password (min 6 characters)"
                        required={!isEdit}
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone size={20} className="mr-2" />
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone size={16} className="mr-2" />
                      Phone Number *
                    </label>
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                      placeholder="Enter phone number (10 digits)"
                      required
                      maxLength={10}
                      pattern="0[0-9]{9}"
                      title="Phone must start with 0 and be exactly 10 digits"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Phone must start with 0 and be exactly 10 digits
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail size={16} className="mr-2" />
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {isEdit ? "Update Staff" : "Create Staff"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

