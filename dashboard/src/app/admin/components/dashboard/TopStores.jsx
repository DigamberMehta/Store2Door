import { Store, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const TopStores = ({ stores = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">
          Top Performing Stores
        </h2>
        <Link
          to="/admin/stores"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Store className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">No store data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store, index) => (
            <div
              key={store._id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  #{index + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {store.name}
                  </p>
                  {store.isVerified && (
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 truncate">
                    {store.address?.suburb || store.location?.suburb || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-gray-900">
                  R{store.totalRevenue?.toFixed(2) || "0.00"}
                </p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {store.totalOrders || 0} orders
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopStores;
