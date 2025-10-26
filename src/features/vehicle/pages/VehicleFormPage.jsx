import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import vehicleService from "../services/vehicleService";
import { useNotification } from "../../../context/NotificationContext";
import ImageUpload from "../../../components/ImageUpload";

const emptyForm = {
  code: "",
  name: "",
  launchDate: "",
  description: "",
  status: true,
  ranking: "Premium",
  imageUrl: "",
};

const rankingOptions = ["Premium", "Standard", "Economy"];

export default function VehicleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showSuccess, showError } = useNotification();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const res = await vehicleService.getById(id);
        const data = res?.data || res;
        console.log("Vehicle data:", data); // Debug log
        setForm({
          code: data.code || "",
          name: data.name || "",
          launchDate: data.launchDate ? data.launchDate.substring(0, 10) : "",
          description: data.description || "",
          status: Boolean(data.status),
          ranking: data.ranking || "Premium",
          imageUrl: data.imageUrl || "",
        });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        launchDate: form.launchDate ? new Date(form.launchDate).toISOString() : null,
      };
      console.log("Sending payload:", payload); // Debug log
      if (isEdit) {
        await vehicleService.update(id, payload);
        showSuccess("Vehicle model updated successfully!");
      } else {
        await vehicleService.create(payload);
        showSuccess("Vehicle model created successfully!");
      }
      navigate("/admin/vehiclemodels");
    } catch (e) {
      const errorMessage = e.message || e.response?.data?.message || "An error occurred";
      setError(e);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isEdit ? "Edit Vehicle Model" : "New Vehicle Model"}</h1>
        <p className="text-gray-600">{isEdit ? "Update vehicle model information" : "Create a new vehicle model for your fleet"}</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {String(error.message || error)}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
            <input 
              name="code" 
              value={form.code} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
              placeholder="e.g. VF4-M2"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
              placeholder="e.g. VF4"
              required 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Launch Date</label>
          <input 
            type="date" 
            name="launchDate" 
            value={form.launchDate} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none" 
            rows={4}
            placeholder="Enter vehicle model description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model Image</label>
          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ranking</label>
            <select 
              name="ranking" 
              value={form.ranking} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            >
              {rankingOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <div className="flex items-center h-12">
              <input 
                id="status" 
                type="checkbox" 
                name="status" 
                checked={form.status} 
                onChange={handleChange} 
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" 
              />
              <label htmlFor="status" className="ml-3 text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
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
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Vehicle Model"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}