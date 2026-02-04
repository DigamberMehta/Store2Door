import { Bike, Phone, Star } from "lucide-react";

const RiderCard = ({ rider, isSelected, onClick, formatTime }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
        isSelected
          ? "bg-green-50 border-green-500 shadow-md"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded flex items-center justify-center text-white font-semibold ${
                rider.isAvailable ? "bg-green-600" : "bg-gray-500"
              }`}
            >
              {rider.userId?.name?.[0]?.toUpperCase() || "R"}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                rider.isAvailable ? "bg-green-400" : "bg-gray-400"
              }`}
            ></div>
          </div>
          <div>
            <p className="font-semibold text-xs text-gray-900">
              {rider.userId?.name || "Unknown"}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              <span className="text-[10px]">
                {rider.userId?.phone || "N/A"}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            rider.isAvailable
              ? "bg-green-600 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          {rider.isAvailable ? "Online" : "Offline"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {rider.vehicle && (
          <span className="text-gray-600 capitalize">
            <Bike className="w-3 h-3 inline mr-1" />
            {rider.vehicle.type}
          </span>
        )}
        {rider.stats?.averageRating && (
          <span className="text-yellow-600">
            <Star className="w-3 h-3 inline fill-current mr-0.5" />
            {rider.stats.averageRating.toFixed(1)}
          </span>
        )}
        <span className="text-gray-500 ml-auto">
          {formatTime(rider.lastActiveAt)}
        </span>
      </div>
    </button>
  );
};

export default RiderCard;
