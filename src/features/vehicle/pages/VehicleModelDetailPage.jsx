import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import vehicleService from "../services/vehicleService";
import variantService from "../services/variantService";

export default function VehicleModelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, v] = await Promise.all([
          vehicleService.getById(id),
          variantService.list({ modelId: id, pageSize: 1000 }),
        ]);
        const modelData = m?.data || m;
        const vItems = v?.data?.items || v?.items || v || [];
        const vArr = Array.isArray(vItems) ? vItems : [];
        // Client-side filter fallback
        setVariants(vArr.filter((x) => x.modelId === id || !x.modelId || id == null ? true : x.modelId === id));
        setModel(modelData);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const title = useMemo(() => (model ? `${model.name} ${model.code ? `(${model.code})` : ""}` : "Vehicle Model"), [model]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{String(error.message || error)}</div>;
  if (!model) return <div>Not found</div>;

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">Vehicle model details and variants</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/admin/vehiclemodels/${id}/edit`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Edit Model
          </Link>
          <Link
            to={`/admin/vehiclemodels/${id}/variants/new`}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            + Add Variant
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
              {model.imageUrl ? (
                <img 
                  src={model.imageUrl} 
                  alt={model.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${model.imageUrl ? 'hidden' : 'flex'}`}>
                <div className="text-6xl opacity-30">🚗</div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Code</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{model.code || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Launch Date</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{model.launchDate ? new Date(model.launchDate).toLocaleDateString() : "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ranking</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                      {String(model.ranking ?? "-")}
                    </span>
                  </dd>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${model.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {model.status ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</dt>
                  <dd className="mt-1 text-lg text-gray-900">{model.description || "No description provided"}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Variants</h2>
          <span className="text-sm text-gray-500">{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
        </div>
        {variants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No variants yet</h3>
            <p className="text-gray-500 mb-6">Add color variants and specifications for this vehicle model</p>
            <Link
              to={`/admin/vehiclemodels/${id}/variants/new`}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              + Add First Variant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {variants.map((v) => (
              <div key={v.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  {v.imageUrl ? (
                    <img src={v.imageUrl} alt={v.color || "Variant"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="text-4xl opacity-30">🎨</div>
                  )}
                  <div className="absolute top-3 right-3">
                    {v.createdDate && (
                      <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        {new Date(v.createdDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{v.color || "Variant"}</div>
                  </div>
                  <div className="text-2xl font-bold text-teal-600">
                    {v.price != null ? `${v.price.toLocaleString()} ₫` : "—"}
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      to={`/admin/vehiclemodels/${id}/variants/${v.id}/edit`}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-center block"
                    >
                      Edit Variant
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


