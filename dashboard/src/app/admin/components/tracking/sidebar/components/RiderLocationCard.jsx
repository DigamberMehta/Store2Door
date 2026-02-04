import { MapPin } from "lucide-react";

const RiderLocationCard = ({ currentLocation, formatTime }) => {
  if (!currentLocation?.coordinates) return null;

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-xs text-gray-700 mb-2.5 flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-green-600" />
        Location
      </h4>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Lat</span>
          <span className="font-mono text-gray-900">
            {currentLocation.coordinates[1].toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Long</span>
          <span className="font-mono text-gray-900">
            {currentLocation.coordinates[0].toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between p-2 bg-green-50 rounded-lg text-green-700">
          <span>Updated</span>
          <span className="font-medium">
            {formatTime(currentLocation.lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiderLocationCard;
