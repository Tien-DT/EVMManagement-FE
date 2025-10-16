import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dealerService from "../services/dealerService";

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  establishedAt: "",
  isActive: true,
};

export default function DealerFormPage() {
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
        const res = await dealerService.getById(id);
        const data = res?.data || res;
        setForm({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          establishedAt: data.establishedAt ? data.establishedAt.substring(0, 10) : "",
          isActive: Boolean(data.isActive),
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
        establishedAt: form.establishedAt ? new Date(form.establishedAt).toISOString() : null,
      };
      if (isEdit) {
        await dealerService.update(id, payload);
      } else {
        await dealerService.create(payload);
      }
      navigate("/admin/dealers");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? "Edit Dealer" : "New Dealer"}</h1>
      {error && <div className="mb-4 text-red-600">{String(error.message || error)}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Established Date</label>
            <input type="date" name="establishedAt" value={form.establishedAt} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center mt-6">
            <input id="isActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="mr-2" />
            <label htmlFor="isActive">Active</label>
          </div>
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


