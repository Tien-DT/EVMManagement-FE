import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useVehicleVariantDetail } from "../hooks/useVehicleVariants";
import { useVariantMutations } from "../hooks/useVehicleVariants";

export default function VehicleVariantDetailPage() {
  const { id: modelId, variantId } = useParams();
  const navigate = useNavigate();
  const { variant, loading, error, reload } = useVehicleVariantDetail(variantId);
  const { deleteVariant } = useVariantMutations();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
    try {
      await deleteVariant(variantId);
      navigate(`/admin/vehiclemodels/${modelId}`);
    } catch (e) {
      console.error("Failed to delete variant:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error.message || String(error)}</div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Variant not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {variant.color || "Vehicle Variant"}
            </h1>
          </div>
          <p className="text-gray-600 mt-1 ml-11">Vehicle variant details and specifications</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/admin/vehiclemodels/${modelId}/variants/${variantId}/edit`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Edit Variant
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Image and Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
              {variant.imageUrl ? (
                <img 
                  src={variant.imageUrl} 
                  alt={variant.color || "Variant"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${variant.imageUrl ? 'hidden' : 'flex'}`}>
                <div className="text-6xl opacity-30">🚗</div>
              </div>
            </div>
          </div>
          
          {/* Basic Info Section */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Color" value={variant.color} />
              <DetailItem label="Price" value={variant.price != null ? `${variant.price.toLocaleString()} ₫` : null} />
              <DetailItem label="Engine" value={variant.engine} />
              <DetailItem label="Maximum Speed" value={variant.maximumSpeed != null ? `${variant.maximumSpeed} km/h` : null} />
              <div className="md:col-span-2">
                <DetailItem label="Description" value={variant.description} multiline />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battery & Power Specifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">🔋</span>
          Battery & Power Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="Battery Type" value={variant.batteryType} />
          <DetailItem label="Battery Life" value={variant.batteryLife} />
          <DetailItem label="Charging Time" value={variant.chargingTime != null ? `${variant.chargingTime} hours` : null} />
          <DetailItem label="Charging Capacity" value={variant.chargingCapacity != null ? `${variant.chargingCapacity} kW` : null} />
          <DetailItem label="Distance Per Charge" value={variant.distancePerCharge} />
          <DetailItem label="Capacity" value={variant.capacity != null ? `${variant.capacity} kWh` : null} />
        </div>
      </div>

      {/* Physical Specifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">📐</span>
          Physical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="Length" value={variant.length != null ? `${variant.length} mm` : null} />
          <DetailItem label="Width" value={variant.width != null ? `${variant.width} mm` : null} />
          <DetailItem label="Height" value={variant.height != null ? `${variant.height} mm` : null} />
          <DetailItem label="Weight" value={variant.weight != null ? `${variant.weight} kg` : null} />
          <DetailItem label="Ground Clearance" value={variant.groundClearance != null ? `${variant.groundClearance} mm` : null} />
          <DetailItem label="Trunk Width" value={variant.trunkWidth != null ? `${variant.trunkWidth} mm` : null} />
        </div>
      </div>

      {/* Mechanical Specifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">⚙️</span>
          Mechanical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="Shock Absorbers" value={variant.shockAbsorbers} />
          <DetailItem label="Brakes" value={variant.brakes} />
        </div>
      </div>

      {/* Metadata */}
      {(variant.createdDate || variant.updatedDate || variant.id) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">ℹ️</span>
            Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem label="Variant ID" value={variant.id} />
            <DetailItem 
              label="Created Date" 
              value={variant.createdDate ? new Date(variant.createdDate).toLocaleString() : null} 
            />
            <DetailItem 
              label="Updated Date" 
              value={variant.updatedDate ? new Date(variant.updatedDate).toLocaleString() : null} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail items
function DetailItem({ label, value, multiline = false }) {
  const displayValue = value ?? "—";
  
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </dt>
      <dd className={`text-lg font-semibold text-gray-900 ${multiline ? 'whitespace-pre-wrap' : ''}`}>
        {displayValue}
      </dd>
    </div>
  );
}

