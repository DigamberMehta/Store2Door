import { Bike } from "lucide-react";

const RiderVehicleCard = ({ vehicle }) => {
  if (!vehicle) return null;

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-xs text-gray-700 mb-2.5 flex items-center gap-1.5">
        <Bike className="w-4 h-4 text-green-600" />
        Vehicle
      </h4>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Type</span>
          <span className="font-medium text-gray-900 capitalize">
            {vehicle.type || "N/A"}
          </span>
        </div>
        {vehicle.licensePlate && (
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Plate</span>
            <span className="font-mono font-bold text-gray-900">
              {vehicle.licensePlate}
            </span>
          </div>
        )}
        {vehicle.make && (
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Model</span>
            <span className="font-medium text-gray-900">
              {vehicle.make} {vehicle.model}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderVehicleCard;
