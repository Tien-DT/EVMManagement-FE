import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDealers, useDealerMutations } from "../hooks/useDealers";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Building2
} from "lucide-react";

export default function DealerListPage() {
  const { dealers, loading, error, reload } = useDealers();
  const { deleteDealer, loading: mutating } = useDealerMutations();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter dealers based on search and status
  const filteredDealers = useMemo(() => {
    return dealers.filter(dealer => {
      const matchesSearch = dealer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dealer.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && dealer.isActive) ||
                           (statusFilter === "inactive" && !dealer.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [dealers, searchTerm, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dealer? This action cannot be undone.")) return;
    try {
      await deleteDealer(id);
      reload();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dealers</h1>
            <p className="text-gray-600 mt-1">Manage your dealer network ({filteredDealers.length} dealers)</p>
          </div>
        <Link
          to="/admin/dealers/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
            <Plus size={20} className="mr-2" />
            Add New Dealer
        </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search dealers by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {String(error.message || error)}
        </div>
      )}

      {/* Loading State */}
      {(loading || mutating) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !mutating && filteredDealers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all" ? "No dealers found" : "No dealers yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first dealer"}
          </p>
          {(!searchTerm && statusFilter === "all") && (
            <Link
              to="/admin/dealers/new"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add First Dealer
            </Link>
          )}
        </div>
      )}

      {/* Dealers Grid */}
      {!loading && !mutating && filteredDealers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <div key={dealer.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{dealer.name}</h3>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dealer.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          dealer.isActive ? "bg-green-400" : "bg-red-400"
                        }`}></div>
                        {dealer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{dealer.address || "No address"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>{dealer.phone || "No phone"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{dealer.email || "No email"}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span>
                    {dealer.establishedAt 
                      ? new Date(dealer.establishedAt).toLocaleDateString() 
                      : "Not established"}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/admin/dealers/${dealer.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Building2 size={16} className="mr-2" />
                    View Details
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/dealers/${dealer.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      <Edit3 size={16} className="mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(dealer.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
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