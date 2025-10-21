import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import variantService from "../services/variantService";
import vehicleService from "../services/vehicleService";
import { useNotification } from "../../../context/NotificationContext";

const emptyForm = {
  modelId: "",
  color: "",
  maximumSpeed: "",
  price: "",
  description: "",
  imageUrl: "",
};

export default function VehicleVariantFormPage() {
  const navigate = useNavigate();
  const { id, variantId } = useParams();
  const isEdit = Boolean(variantId);
  const { showSuccess, showError } = useNotification();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    // Load vehicle models for dropdown
    (async () => {
      try {
        const res = await vehicleService.list({ pageSize: 1000 });
        const items = res?.data?.items || res?.items || res || [];
        setModels(Array.isArray(items) ? items : []);
      } catch (_) {}
    })();

    if (!isEdit) {
      // When creating under a model route, preset modelId
      if (id) {
        setForm((prev) => ({ ...prev, modelId: id }));
      }
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await variantService.getById(variantId);
        const data = res?.data || res;
        setForm({
          modelId: data.modelId || "",
          color: data.color || "",
          maximumSpeed: data.maximumSpeed ?? "",
          price: data.price ?? "",
          description: data.description || "",
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        maximumSpeed:
          form.maximumSpeed === "" ? null : Number(form.maximumSpeed),
        price: form.price === "" ? null : Number(form.price),
      };
      if (isEdit) {
        await variantService.update(variantId, payload);
        showSuccess("Vehicle variant updated successfully!");
      } else {
        await variantService.create(payload);
        showSuccess("Vehicle variant created successfully!");
      }
      if (id) {
        navigate(`/admin/vehiclemodels/${id}`);
      } else {
        navigate("/admin/vehiclemodels");
      }
    } catch (e) {
      const errorMessage = e.message || e.response?.data?.message || "An error occurred";
      setError(e);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {isEdit ? "Edit Vehicle Variant" : "New Vehicle Variant"}
      </h1>
      {error && <div className="text-red-600 mb-3">{error.message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          {id ? (
            <input
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={(models.find((m) => m.id === id)?.name || "") + (models.find((m) => m.id === id)?.code ? ` (${models.find((m) => m.id === id)?.code})` : "")}
              readOnly
            />
          ) : (
            <select
              name="modelId"
              value={form.modelId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="" disabled>
                Select a model
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.code ? `(${m.code})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Black"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Speed</label>
            <input
              name="maximumSpeed"
              type="number"
              step="0.01"
              value={form.maximumSpeed}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 220"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 100000000"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}


