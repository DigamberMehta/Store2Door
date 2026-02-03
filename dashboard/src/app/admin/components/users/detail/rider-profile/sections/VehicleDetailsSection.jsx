import { Bike, Edit } from "lucide-react";

const VehicleDetailsSection = ({ profile, onEditClick }) => {
  if (!profile.vehicle) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bike className="w-5 h-5 text-gray-700" />
          <h2 className="text-base font-semibold text-gray-900">
            Vehicle Details
          </h2>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {profile.vehicle.type && (
          <div>
            <span className="text-xs text-gray-500">Vehicle Type</span>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {profile.vehicle.type}
            </p>
          </div>
        )}
        {profile.vehicle.make && (
          <div>
            <span className="text-xs text-gray-500">Make</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.vehicle.make}
            </p>
          </div>
        )}
        {profile.vehicle.model && (
          <div>
            <span className="text-xs text-gray-500">Model</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.vehicle.model}
            </p>
          </div>
        )}
        {profile.vehicle.year && (
          <div>
            <span className="text-xs text-gray-500">Year</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.vehicle.year}
            </p>
          </div>
        )}
        {profile.vehicle.color && (
          <div>
            <span className="text-xs text-gray-500">Color</span>
            <p className="text-sm font-medium text-gray-900">
              {profile.vehicle.color}
            </p>
          </div>
        )}
        {profile.vehicle.licensePlate && (
          <div>
            <span className="text-xs text-gray-500">License Plate</span>
            <p className="text-sm font-medium text-gray-900 uppercase">
              {profile.vehicle.licensePlate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
