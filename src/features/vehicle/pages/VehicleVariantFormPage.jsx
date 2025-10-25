import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import variantService from "../services/variantService";
import vehicleService from "../services/vehicleService";
import { useNotification } from "../../../context/NotificationContext";
import ImageUpload from "../../../components/ImageUpload";

const emptyForm = {
  modelId: "",
  color: "",
  chargingTime: "",
  engine: "",
  capacity: "",
  shockAbsorbers: "",
  batteryType: "",
  batteryLife: "",
  maximumSpeed: "",
  distancePerCharge: "",
  weight: "",
  groundClearance: "",
  brakes: "",
  length: "",
  width: "",
  height: "",
  price: "",
  trunkWidth: "",
  description: "",
  chargingCapacity: "",
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
          chargingTime: data.chargingTime ?? "",
          engine: data.engine || "",
          capacity: data.capacity ?? "",
          shockAbsorbers: data.shockAbsorbers || "",
          batteryType: data.batteryType || "",
          batteryLife: data.batteryLife || "",
          maximumSpeed: data.maximumSpeed ?? "",
          distancePerCharge: data.distancePerCharge || "",
          weight: data.weight ?? "",
          groundClearance: data.groundClearance ?? "",
          brakes: data.brakes || "",
          length: data.length ?? "",
          width: data.width ?? "",
          height: data.height ?? "",
          price: data.price ?? "",
          trunkWidth: data.trunkWidth ?? "",
          description: data.description || "",
          chargingCapacity: data.chargingCapacity ?? "",
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
        modelId: form.modelId,
        color: form.color,
        engine: form.engine || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        batteryType: form.batteryType || null,
        batteryLife: form.batteryLife || null,
        distancePerCharge: form.distancePerCharge || null,
        shockAbsorbers: form.shockAbsorbers || null,
        brakes: form.brakes || null,
        // Number fields
        chargingTime: form.chargingTime === "" ? null : Number(form.chargingTime),
        capacity: form.capacity === "" ? null : Number(form.capacity),
        maximumSpeed: form.maximumSpeed === "" ? null : Number(form.maximumSpeed),
        weight: form.weight === "" ? null : Number(form.weight),
        groundClearance: form.groundClearance === "" ? null : Number(form.groundClearance),
        length: form.length === "" ? null : Number(form.length),
        width: form.width === "" ? null : Number(form.width),
        height: form.height === "" ? null : Number(form.height),
        price: form.price === "" ? null : Number(form.price),
        trunkWidth: form.trunkWidth === "" ? null : Number(form.trunkWidth),
        chargingCapacity: form.chargingCapacity === "" ? null : Number(form.chargingCapacity),
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
        {isEdit ? "Edit Vehicle Variant" : "New Vehicle Variant"}
      </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Basic Information
          </h2>
          <div className="space-y-4">
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Model <span className="text-red-500">*</span>
              </label>
          {id ? (
            <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                  value={
                    (models.find((m) => m.id === id)?.name || "") +
                    (models.find((m) => m.id === id)?.code
                      ? ` (${models.find((m) => m.id === id)?.code})`
                      : "")
                  }
              readOnly
            />
          ) : (
            <select
              name="modelId"
              value={form.modelId}
              onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color <span className="text-red-500">*</span>
              </label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. Black, White, Red"
            required
          />
        </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₫)</label>
            <input
              name="price"
              type="number"
                step="1"
              value={form.price}
              onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g. 100000000"
            />
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Image</label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Vehicle variant description..."
              />
            </div>
          </div>
        </div>

        {/* Battery & Power Specifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔋</span>
            Battery & Power Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Battery Type
              </label>
              <input
                name="batteryType"
                value={form.batteryType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. Lithium-ion"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Battery Life
              </label>
              <input
                name="batteryLife"
                value={form.batteryLife}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 5 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charging Time (hours)
              </label>
              <input
                name="chargingTime"
                type="number"
                step="0.1"
                value={form.chargingTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charging Capacity (kW)
              </label>
              <input
                name="chargingCapacity"
                type="number"
                step="0.1"
                value={form.chargingCapacity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 7.4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (kWh)
              </label>
              <input
                name="capacity"
                type="number"
                step="0.1"
                value={form.capacity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance Per Charge
              </label>
              <input
                name="distancePerCharge"
                value={form.distancePerCharge}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 300 km"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine
              </label>
              <input
                name="engine"
                value={form.engine}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. Electric Motor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Speed (km/h)
              </label>
              <input
                name="maximumSpeed"
                type="number"
                step="1"
                value={form.maximumSpeed}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 150"
              />
            </div>
          </div>
        </div>

        {/* Physical Specifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📐</span>
            Physical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (mm)
              </label>
              <input
                name="length"
                type="number"
                step="1"
                value={form.length}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 4500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (mm)
              </label>
              <input
                name="width"
                type="number"
                step="1"
                value={form.width}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 1800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (mm)
              </label>
              <input
                name="height"
                type="number"
                step="1"
                value={form.height}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 1500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                name="weight"
                type="number"
                step="1"
                value={form.weight}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 1500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ground Clearance (mm)
              </label>
              <input
                name="groundClearance"
                type="number"
                step="1"
                value={form.groundClearance}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 180"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trunk Width (mm)
              </label>
              <input
                name="trunkWidth"
                type="number"
                step="1"
                value={form.trunkWidth}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 1000"
              />
            </div>
          </div>
        </div>

        {/* Mechanical Specifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            Mechanical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shock Absorbers
              </label>
              <input
                name="shockAbsorbers"
                value={form.shockAbsorbers}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. MacPherson strut"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brakes
              </label>
              <input
                name="brakes"
                value={form.brakes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. Disc brakes"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Saving..." : isEdit ? "Update Variant" : "Create Variant"}
          </button>
        </div>
      </form>
    </div>
  );
}


