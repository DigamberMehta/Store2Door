import { ArrowLeft, Star } from "lucide-react";
import RiderContactCard from "./RiderContactCard";
import RiderStatsCard from "./RiderStatsCard";
import RiderVehicleCard from "./RiderVehicleCard";
import RiderLocationCard from "./RiderLocationCard";
import ActiveOrderCard from "./ActiveOrderCard";

const RiderDetailView = ({
  rider,
  onBack,
  formatTime,
  getStatusColor,
  onTrackOrder,
  onShowAssignModal,
  onUnassignOrder,
  unassigningOrder,
}) => {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-all hover:translate-x-1 duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to list</span>
        </button>

        {/* Rider Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ${
                rider.isAvailable
                  ? "bg-white/20 backdrop-blur-sm"
                  : "bg-gray-600"
              }`}
            >
              {rider.userId?.name?.[0]?.toUpperCase() || "R"}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                rider.isAvailable ? "bg-green-400 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-white">
              {rider.userId?.name || "Unknown"}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm ${
                  rider.isAvailable
                    ? "bg-white text-green-700"
                    : "bg-white/80 text-gray-700"
                }`}
              >
                {rider.isAvailable ? "● Available" : "● Offline"}
              </span>
              {rider.stats?.averageRating && (
                <span className="inline-flex items-center gap-1 text-xs text-yellow-300 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {rider.stats.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          <RiderContactCard
            userId={rider.userId}
            lastActiveAt={rider.lastActiveAt}
            formatTime={formatTime}
          />

          <RiderStatsCard stats={rider.stats} />

          <RiderVehicleCard vehicle={rider.vehicle} />

          <RiderLocationCard
            currentLocation={rider.currentLocation}
            formatTime={formatTime}
          />

          <ActiveOrderCard
            activeOrder={rider.activeOrder}
            getStatusColor={getStatusColor}
            onTrackOrder={onTrackOrder}
            onShowAssignModal={onShowAssignModal}
            onUnassignOrder={onUnassignOrder}
            unassigningOrder={unassigningOrder}
          />
        </div>
      </div>
    </>
  );
};

export default RiderDetailView;
