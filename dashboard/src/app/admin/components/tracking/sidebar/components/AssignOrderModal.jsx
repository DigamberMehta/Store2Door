import { X, AlertCircle, Phone, Star, UserCheck, Package } from "lucide-react";

const AssignOrderModal = ({
  show,
  onClose,
  selectedRider,
  riders,
  onAssignOrder,
  assigningOrder,
}) => {
  if (!show || !selectedRider?.activeOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Assign Order</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 text-sm">
            Order #{selectedRider.activeOrder.orderNumber}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Note:</p>
                <p>
                  Assigning this order to another driver will remove it from{" "}
                  <span className="font-semibold">
                    {selectedRider.userId?.name}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Select Available Driver
          </h4>

          <div className="space-y-2">
            {riders
              .filter(
                (r) =>
                  r.isAvailable &&
                  r._id !== selectedRider._id &&
                  !r.activeOrder,
              )
              .map((rider) => (
                <button
                  key={rider._id}
                  onClick={() => onAssignOrder(rider._id)}
                  disabled={assigningOrder}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                        {rider.userId?.name?.[0]?.toUpperCase() || "R"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {rider.userId?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {rider.userId?.phone || "N/A"}
                        </span>
                        {rider.stats?.averageRating && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
                            {rider.stats.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <UserCheck className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                </button>
              ))}

            {riders.filter(
              (r) =>
                r.isAvailable && r._id !== selectedRider._id && !r.activeOrder,
            ).length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No available drivers to assign
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignOrderModal;
