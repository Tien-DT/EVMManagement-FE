import React from "react";
import { Link } from "react-router-dom";
import { useDealers, useDealerMutations } from "../hooks/useDealers";

const columns = [
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "establishedAt", label: "Established" },
  { key: "isActive", label: "Status" },
];

export default function DealerListPage() {
  const { dealers, loading, error, reload } = useDealers();
  const { deleteDealer, loading: mutating } = useDealerMutations();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this dealer?")) return;
    try {
      await deleteDealer(id);
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Dealers</h1>
        <Link
          to="/admin/dealers/new"
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          New Dealer
        </Link>
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
            {dealers.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2">{d.address}</td>
                <td className="px-4 py-2">{d.phone}</td>
                <td className="px-4 py-2">{d.email}</td>
                <td className="px-4 py-2">
                  {d.establishedAt ? new Date(d.establishedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${d.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                  <Link
                    to={`/admin/dealers/${d.id}/edit`}
                    className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && dealers.length === 0 && (
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