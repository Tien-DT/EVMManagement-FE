import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePromotion, usePromotionMutations } from "../hooks/usePromotions";
import vehicleService from "../../vehicle/services/vehicleService";
import variantService from "../../vehicle/services/variantService";
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Percent, 
  Tag, 
  FileText,
  ToggleLeft,
  ToggleRight,
  Car,
  X
} from "lucide-react";

const emptyForm = {
  code: "",
  name: "",
  description: "",
  discountPercent: 0,
  startAt: "",
  endAt: "",
  isActive: true,
  variantIds: [],
};

export default function PromotionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { promotion, loading: loadingPromotion, error: promotionError } = usePromotion(id);
  const { createPromotion, updatePromotion, loading: mutating, error: mutationError } = usePromotionMutations();

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Fetch models on mount
  useEffect(() => {
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const response = await vehicleService.list({ pageSize: 1000 });
        const modelsData = response?.data?.items || response?.items || response?.data || [];
        setModels(Array.isArray(modelsData) ? modelsData : []);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  // Fetch variants when model is selected
  useEffect(() => {
    const fetchVariants = async () => {
      if (!selectedModelId) {
        setVariants([]);
        return;
      }
      
      setLoadingVariants(true);
      try {
        const response = await variantService.list({ modelId: selectedModelId, pageSize: 1000 });
        const variantsData = response?.data?.items || response?.items || response?.data || [];
        setVariants(Array.isArray(variantsData) ? variantsData : []);
      } catch (error) {
        console.error("Error fetching variants:", error);
        setVariants([]);
      } finally {
        setLoadingVariants(false);
      }
    };
    fetchVariants();
  }, [selectedModelId]);

  // Load promotion data for editing
  useEffect(() => {
    if (isEdit && promotion) {
      setForm({
        code: promotion.code || "",
        name: promotion.name || "",
        description: promotion.description || "",
        discountPercent: promotion.discountPercent || 0,
        startAt: promotion.startAt ? new Date(promotion.startAt).toISOString().slice(0, 16) : "",
        endAt: promotion.endAt ? new Date(promotion.endAt).toISOString().slice(0, 16) : "",
        isActive: Boolean(promotion.isActive),
        variantIds: promotion.variantIds || [],
      });
      
      // If promotion has variants, try to determine the model
      if (promotion.variantIds && promotion.variantIds.length > 0) {
        // We'll need to fetch variant details to get modelId
        // For now, we'll leave it empty and let user re-select
      }
    }
  }, [isEdit, promotion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.code.trim()) {
      errors.code = "Promotion code is required";
    } else if (form.code.length < 3) {
      errors.code = "Promotion code must be at least 3 characters";
    }

    if (!form.name.trim()) {
      errors.name = "Promotion name is required";
    }

    if (form.discountPercent < 0 || form.discountPercent > 100) {
      errors.discountPercent = "Discount must be between 0 and 100";
    }

    if (!form.startAt) {
      errors.startAt = "Start date is required";
    }

    if (!form.endAt) {
      errors.endAt = "End date is required";
    }

    if (form.startAt && form.endAt && new Date(form.startAt) >= new Date(form.endAt)) {
      errors.endAt = "End date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        ...form,
        discountPercent: Number(form.discountPercent),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        variantIds: form.variantIds || [],
      };

      if (isEdit) {
        await updatePromotion(id, payload);
      } else {
        await createPromotion(payload);
      }
      
      navigate("/admin/promotions");
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  if (loadingPromotion) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading promotion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Promotion" : "Create New Promotion"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? "Update promotion details" : "Set up a new promotional campaign"}
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(promotionError || mutationError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {String(promotionError?.message || promotionError || mutationError?.message || mutationError)}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag size={20} className="mr-2 text-teal-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promotion Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., SUMMER2024"
                  required
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
              </div>

              {/* Promotion Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe the promotion details..."
              />
            </div>
          </div>

          {/* Discount Settings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Percent size={20} className="mr-2 text-teal-600" />
              Discount Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPercent"
                    value={form.discountPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      formErrors.discountPercent ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0"
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                </div>
                {formErrors.discountPercent && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.discountPercent}</p>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      form.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {form.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span className="font-medium">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Car size={20} className="mr-2 text-teal-600" />
              Chọn Xe Áp Dụng Khuyến Mãi
            </h2>
            
            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Model
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => {
                    setSelectedModelId(e.target.value);
                    // Clear selected variants when model changes
                    setForm(prev => ({ ...prev, variantIds: [] }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={loadingModels}
                >
                  <option value="">-- Chọn Model --</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.code ? `(${model.code})` : ""}
                    </option>
                  ))}
                </select>
                {loadingModels && (
                  <p className="mt-1 text-sm text-gray-500">Đang tải danh sách model...</p>
                )}
              </div>

              {/* Variants Selection */}
              {selectedModelId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Variants (Có thể chọn nhiều)
                  </label>
                  {loadingVariants ? (
                    <p className="text-sm text-gray-500">Đang tải danh sách variants...</p>
                  ) : variants.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có variant nào cho model này</p>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                      <div className="space-y-2">
                        {variants.map((variant) => {
                          const isSelected = form.variantIds.includes(variant.id);
                          return (
                            <label
                              key={variant.id}
                              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-teal-50 border-2 border-teal-500"
                                  : "bg-white border-2 border-transparent hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setForm(prev => ({
                                      ...prev,
                                      variantIds: [...prev.variantIds, variant.id]
                                    }));
                                  } else {
                                    setForm(prev => ({
                                      ...prev,
                                      variantIds: prev.variantIds.filter(id => id !== variant.id)
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                              />
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">
                                  {variant.color || variant.name || "Variant"}
                                </span>
                                {variant.price && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    - {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(variant.price)}
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Selected Variants Summary */}
                  {form.variantIds.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Đã chọn {form.variantIds.length} variant(s):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {form.variantIds.map((variantId) => {
                          const variant = variants.find(v => v.id === variantId);
                          if (!variant) return null;
                          return (
                            <span
                              key={variantId}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                            >
                              <span>{variant.color || variant.name || variantId}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setForm(prev => ({
                                    ...prev,
                                    variantIds: prev.variantIds.filter(id => id !== variantId)
                                  }));
                                }}
                                className="ml-1 hover:text-teal-900"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-teal-600" />
              Date Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startAt"
                  value={form.startAt}
                  onChange={handleChange}
                  min={getCurrentDateTime()}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.startAt ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {formErrors.startAt && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.startAt}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endAt"
                  value={form.endAt}
                  onChange={handleChange}
                  min={form.startAt || getCurrentDateTime()}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.endAt ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {formErrors.endAt && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.endAt}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutating}
            className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {mutating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                {isEdit ? "Update Promotion" : "Create Promotion"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
