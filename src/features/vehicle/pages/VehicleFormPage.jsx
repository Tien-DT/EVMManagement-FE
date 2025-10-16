import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import vehicleService from "../services/vehicleService";

const emptyForm = {
  code: "",
  name: "",
  launchDate: "",
  description: "",
  status: true,
  ranking: "Premium",
};

export default function VehicleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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
        setForm({
          code: data.code || "",
          name: data.name || "",
          launchDate: data.launchDate ? data.launchDate.substring(0, 10) : "",
          description: data.description || "",
          status: Boolean(data.status),
          ranking: data.ranking || "Premium",
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
      if (isEdit) {
        await vehicleService.update(id, payload);
      } else {
        await vehicleService.create(payload);
      }
      navigate("/admin/vehicles");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? "Edit Vehicle" : "New Vehicle"}</h1>
      {error && <div className="mb-4 text-red-600">{String(error.message || error)}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm mb-1">Code</label>
          <input name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Launch Date</label>
            <input type="date" name="launchDate" value={form.launchDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center mt-6">
            <input id="status" type="checkbox" name="status" checked={form.status} onChange={handleChange} className="mr-2" />
            <label htmlFor="status">Active</label>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm mb-1">Ranking</label>
          <select name="ranking" value={form.ranking} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Economy">Economy</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


