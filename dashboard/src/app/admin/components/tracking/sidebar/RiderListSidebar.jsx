import {
  Bike,
  Star,
  Phone,
  MapPin,
  Clock,
  Package,
  Store,
  User,
  Navigation,
  X,
  Mail,
  ArrowLeft,
  TrendingUp,
  Award,
} from "lucide-react";

const RiderListSidebar = ({ riders, selectedRider, onRiderSelect, stats }) => {
  const formatTime = (date) => {
    if (!date) return "N/A";
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      assigned: "bg-orange-100 text-orange-700 border-orange-200",
      ready_for_pickup: "bg-yellow-100 text-yellow-700 border-yellow-200",
      picked_up: "bg-blue-100 text-blue-700 border-blue-200",
      on_the_way: "bg-purple-100 text-purple-700 border-purple-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="w-90 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Show detailed view when rider is selected */}
      {selectedRider ? (
        <>
          {/* Header */}
          <div className="bg-green-600 text-white p-3 border-b border-green-700">
            <button
              onClick={() => onRiderSelect(null)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            {/* Rider Info */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl ${
                    selectedRider.isAvailable ? "bg-green-700" : "bg-gray-600"
                  }`}
                >
                  {selectedRider.userId?.name?.[0]?.toUpperCase() || "R"}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    selectedRider.isAvailable ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-white">
                  {selectedRider.userId?.name || "Unknown"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      selectedRider.isAvailable
                        ? "bg-white text-green-700"
                        : "bg-white/80 text-gray-700"
                    }`}
                  >
                    {selectedRider.isAvailable ? "Available" : "Offline"}
                  </span>
                  {selectedRider.stats?.averageRating && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-yellow-300">
                      <Star className="w-3 h-3 fill-current" />
                      {selectedRider.stats.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-3">
              {/* Contact */}
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <h4 className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Contact
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-700">
                      {selectedRider.userId?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-600 truncate">
                      {selectedRider.userId?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-700">
                      {formatTime(selectedRider.lastActiveAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {selectedRider.stats && (
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <h4 className="font-semibold text-xs text-gray-700 mb-2">
                    Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">Rating</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedRider.stats.averageRating?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Package className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-gray-600">Orders</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedRider.stats.totalDeliveries || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle */}
              {selectedRider.vehicle && (
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <h4 className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" />
                    Vehicle
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {selectedRider.vehicle.type || "N/A"}
                      </span>
                    </div>
                    {selectedRider.vehicle.licensePlate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plate</span>
                        <span className="font-mono font-bold text-gray-900">
                          {selectedRider.vehicle.licensePlate}
                        </span>
                      </div>
                    )}
                    {selectedRider.vehicle.make && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model</span>
                        <span className="font-medium text-gray-900">
                          {selectedRider.vehicle.make}{" "}
                          {selectedRider.vehicle.model}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedRider.currentLocation?.coordinates && (
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <h4 className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Location
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lat</span>
                      <span className="font-mono text-gray-900">
                        {selectedRider.currentLocation.coordinates[1].toFixed(
                          6,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Long</span>
                      <span className="font-mono text-gray-900">
                        {selectedRider.currentLocation.coordinates[0].toFixed(
                          6,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>Updated</span>
                      <span className="font-medium">
                        {formatTime(selectedRider.currentLocation.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Order */}
              {selectedRider.activeOrder ? (
                <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
                  <h4 className="font-semibold text-xs text-blue-900 mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Active Order
                  </h4>

                  {/* Summary */}
                  <div className="bg-white rounded p-2 mb-2">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order</span>
                        <span className="font-mono font-bold text-gray-900">
                          {selectedRider.activeOrder.orderNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${getStatusColor(
                            selectedRider.activeOrder.status,
                          )}`}
                        >
                          {selectedRider.activeOrder.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-bold text-green-600">
                          R{selectedRider.activeOrder.total?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Store */}
                  {selectedRider.activeOrder.storeId && (
                    <div className="bg-white rounded p-2 mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Store className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold text-gray-900">
                          {selectedRider.activeOrder.storeId.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>
                            {selectedRider.activeOrder.storeId.address?.street},{" "}
                            {selectedRider.activeOrder.storeId.address?.city}
                          </span>
                        </div>
                        {selectedRider.activeOrder.storeId.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>
                              {selectedRider.activeOrder.storeId.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer */}
                  {selectedRider.activeOrder.customerId && (
                    <div className="bg-white rounded p-2 mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-900">
                          {selectedRider.activeOrder.customerId.name}
                        </span>
                      </div>
                      {selectedRider.activeOrder.customerId.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>
                            {selectedRider.activeOrder.customerId.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery */}
                  {selectedRider.activeOrder.deliveryAddress && (
                    <div className="bg-white rounded p-2 mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Navigation className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-semibold text-gray-900">
                          Delivery
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {selectedRider.activeOrder.deliveryAddress.street},{" "}
                        {selectedRider.activeOrder.deliveryAddress.city}{" "}
                        {selectedRider.activeOrder.deliveryAddress.zipCode}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {selectedRider.activeOrder.items &&
                    selectedRider.activeOrder.items.length > 0 && (
                      <div className="bg-white rounded p-2">
                        <div className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center justify-between">
                          <span>Items</span>
                          <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                            {selectedRider.activeOrder.items.length}
                          </span>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedRider.activeOrder.items.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-700">
                                  <span className="font-semibold">
                                    {item.quantity}×
                                  </span>{" "}
                                  {item.name}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  R
                                  {(
                                    item.totalPrice ||
                                    item.price * item.quantity
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No active order</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="bg-green-600 text-white p-3 border-b border-green-700">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
              <Bike className="w-4 h-4" />
              Rider Tracking
            </h2>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded p-2">
                  <p className="text-xl font-bold text-green-600">
                    {stats.onlineRiders || 0}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Online</p>
                </div>
                <div className="bg-white/90 rounded p-2">
                  <p className="text-xl font-bold text-gray-600">
                    {stats.offlineRiders || 0}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Offline</p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xl font-bold text-blue-600">
                    {stats.activeRiders || 0}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Total</p>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="p-2 bg-white border-b border-gray-200">
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded">
                Available ({riders.filter((r) => r.isAvailable).length})
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                All ({riders.length})
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {riders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Bike className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No active riders</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {riders.map((rider) => (
                  <button
                    key={rider._id}
                    onClick={() => onRiderSelect(rider)}
                    className={`w-full text-left p-2.5 rounded-lg border ${
                      selectedRider?._id === rider._id
                        ? "bg-green-50 border-green-500"
                        : "bg-white border-gray-200 hover:border-gray-300"
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RiderListSidebar;
