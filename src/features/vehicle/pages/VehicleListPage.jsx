import React from "react";
import { Link } from "react-router-dom";
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
  
  // Debug log to see what data we're getting
  console.log("Vehicles data:", vehicles);
  const { deleteVehicle, loading: mutating } = useVehicleMutations();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await deleteVehicle(id);
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Models</h1>
          <p className="text-gray-600 mt-1">Manage your electric vehicle models</p>
        </div>
        <Link
          to="/admin/vehiclemodels/new"
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
          + New Vehicle Model
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {String(error.message || error)}
        </div>
      )}

      {(loading || mutating) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {!loading && !mutating && vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicle models</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first vehicle model</p>
          <Link
            to="/admin/vehiclemodels/new"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            + Create Vehicle Model
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                {v.imageUrl ? (
                  <img 
                    src={v.imageUrl} 
                    alt={v.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`text-6xl opacity-20 ${v.imageUrl ? 'hidden' : 'flex'}`}>🚗</div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {v.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Link to={`/admin/vehiclemodels/${v.id}`} className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors group-hover:text-teal-600">
                    {v.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">{v.code}</div>
                </div>
                
                {v.description && (
                  <div className="text-sm text-gray-600 line-clamp-2">{v.description}</div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ranking:</span>
                    <span className="font-medium text-gray-900">{v.ranking}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Launch:</span>
                    <span className="font-medium text-gray-900">{v.launchDate ? new Date(v.launchDate).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/admin/vehiclemodels/${v.id}`}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                    >
                      View Details
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/vehiclemodels/${v.id}/edit`}
                        className="px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}