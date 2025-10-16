import React from "react";
import { useVehicles, useVehicleMutations } from "../hooks/useVehicles";

const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "launchDate", label: "Launch Date" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "ranking", label: "Ranking" },
];

export default function VehicleListPage() {
  const { vehicles, loading, error, reload } = useVehicles();
  const { deleteVehicle, loading: mutating } = useVehicleMutations();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    await deleteVehicle(id);
    reload();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Vehicles</h1>
        <a
          href="/admin/vehicles/new"
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          New Vehicle
        </a>
      </div>

      {error && (
        <div className="mb-4 text-red-600">{String(error.message || error)}</div>
      )}

      {(loading || mutating) && <div className="mb-2">Loading...</div>}

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-4 py-2 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="px-4 py-2">{v.code}</td>
                <td className="px-4 py-2">{v.name}</td>
                <td className="px-4 py-2">{v.launchDate ? new Date(v.launchDate).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2 max-w-[320px] truncate" title={v.description}>{v.description}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${v.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {v.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2">{v.ranking}</td>
                <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                  <a
                    href={`/admin/vehicles/${v.id}/edit`}
                    className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-800"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && vehicles.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={columns.length + 1}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


