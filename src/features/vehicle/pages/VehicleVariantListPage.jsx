import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useVehicleVariants from "../hooks/useVehicleVariants";
import { useVariantMutations } from "../hooks/useVehicleVariants";

export default function VehicleVariantListPage() {
  const navigate = useNavigate();
  const { variants, total, loading, error, fetchVariants } = useVehicleVariants();
  const { deleteVariant } = useVariantMutations();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return variants;
    return variants.filter((v) =>
      [v.color, v.engine, v.batteryType, v.description]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(keyword))
    );
  }, [variants, search]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this variant?")) return;
    await deleteVariant(id);
    fetchVariants();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicle Variants ({total})</h1>
        <button
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
          onClick={() => navigate("/admin/vehicle-variants/new")}
        >
          New Variant
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Search color, engine, battery type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error.message}</div>}

      {filtered.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center text-slate-500">No variants found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((v) => (
            <div key={v.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt={v.color || "Variant"} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400">No image</div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">{v.color || "Variant"}</div>
                  {v.createdDate && (
                    <div className="text-xs text-slate-500">{new Date(v.createdDate).toLocaleDateString()}</div>
                  )}
                </div>
                <div className="text-teal-700 font-bold">
                  {v.price != null ? `${v.price.toLocaleString()} ₫` : "—"}
                </div>
                <div className="pt-2 flex justify-between">
                  <Link
                    to={`/admin/vehicle-variants/${v.id}/edit`}
                    className="px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-900"
                  >
                    Edit
                  </Link>
                  <button
                    className="px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(v.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


