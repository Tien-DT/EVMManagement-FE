import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Battery,
  Zap,
  Users
} from 'lucide-react';

const EvmStaffVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setVehicles([
        {
          id: 1,
          model: 'EVM Sedan Pro',
          variant: 'Standard',
          batteryCapacity: '75 kWh',
          range: '450 km',
          price: 650000000,
          status: 'available',
          stock: 12,
          image: '/api/placeholder/300/200'
        },
        {
          id: 2,
          model: 'EVM SUV Max',
          variant: 'Premium',
          batteryCapacity: '100 kWh',
          range: '600 km',
          price: 850000000,
          status: 'available',
          stock: 8,
          image: '/api/placeholder/300/200'
        },
        {
          id: 3,
          model: 'EVM Hatchback',
          variant: 'Eco',
          batteryCapacity: '50 kWh',
          range: '300 km',
          price: 450000000,
          status: 'low_stock',
          stock: 2,
          image: '/api/placeholder/300/200'
        },
        {
          id: 4,
          model: 'EVM Truck Heavy',
          variant: 'Commercial',
          batteryCapacity: '150 kWh',
          range: '400 km',
          price: 1200000000,
          status: 'out_of_stock',
          stock: 0,
          image: '/api/placeholder/300/200'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Available';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.variant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">Manage electric vehicle catalog and inventory</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center">
          <Plus size={20} className="mr-2" />
          Add New Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by model or variant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Filter size={20} className="mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Vehicle Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Car size={48} className="text-gray-400" />
              </div>

              {/* Vehicle Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{vehicle.model}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {getStatusText(vehicle.status)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{vehicle.variant}</p>
                
                {/* Specifications */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Battery size={16} className="mr-2 text-emerald-500" />
                    <span>{vehicle.batteryCapacity}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap size={16} className="mr-2 text-emerald-500" />
                    <span>{vehicle.range}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users size={16} className="mr-2 text-emerald-500" />
                    <span>Stock: {vehicle.stock} units</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(vehicle.price)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center">
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Edit size={16} />
                  </button>
                  <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Found</h3>
          <p className="text-gray-600">Try changing the filter or search keywords</p>
        </div>
      )}
    </div>
  );
};

export default EvmStaffVehiclesPage;
