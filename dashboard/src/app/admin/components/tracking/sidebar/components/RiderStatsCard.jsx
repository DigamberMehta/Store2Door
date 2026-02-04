import { Star, Package } from "lucide-react";

const RiderStatsCard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-xs text-gray-700 mb-2.5">Stats</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-3 rounded-lg border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span className="text-xs text-gray-600">Rating</span>
          </div>
          <p className="text-lg font-bold text-yellow-700">
            {stats.averageRating?.toFixed(1) || "N/A"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-gray-600">Orders</span>
          </div>
          <p className="text-lg font-bold text-blue-700">
            {stats.totalDeliveries || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiderStatsCard;
