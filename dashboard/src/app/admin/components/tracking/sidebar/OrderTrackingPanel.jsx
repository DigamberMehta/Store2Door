import {
  Package,
  Store,
  Bike,
  MapPin,
  Check,
  Clock,
  Navigation,
  User,
  Phone,
  Calendar,
} from "lucide-react";

const OrderTrackingPanel = ({ order }) => {
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm">
          Select an order to view tracking details
        </p>
      </div>
    );
  }

  // Get timestamp for each status from trackingHistory
  const getStatusTimestamp = (status) => {
    const historyEntry = order.trackingHistory?.find(
      (h) => h.status === status,
    );
    return historyEntry?.updatedAt;
  };

  const trackingSteps = [
    {
      status: "pending",
      label: "Order Placed",
      time: order.createdAt,
      icon: Package,
      color: "green",
    },
    {
      status: "assigned",
      label: "Driver Assigned",
      time: getStatusTimestamp("assigned"),
      icon: Bike,
      color: "blue",
    },
    {
      status: "ready_for_pickup",
      label: "Ready for Pickup",
      time: getStatusTimestamp("ready_for_pickup"),
      icon: Store,
      color: "yellow",
    },
    {
      status: "picked_up",
      label: "Picked Up",
      time: getStatusTimestamp("picked_up"),
      icon: Check,
      color: "purple",
    },
    {
      status: "on_the_way",
      label: "On the Way",
      time: getStatusTimestamp("on_the_way"),
      icon: Navigation,
      color: "indigo",
    },
    {
      status: "delivered",
      label: "Delivered",
      time: order.actualDeliveryTime || getStatusTimestamp("delivered"),
      icon: Check,
      color: "green",
    },
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = [
      "pending",
      "assigned",
      "ready_for_pickup",
      "picked_up",
      "on_the_way",
      "delivered",
    ];
    return statusOrder.indexOf(order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  const formatTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString("en-ZA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Tracking
          </h3>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold">
            {order.orderNumber}
          </span>
        </div>
        <div className="flex items-center gap-2 text-blue-100 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatTime(order.createdAt)}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Steps */}
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const status = getStepStatus(index);
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      status === "completed"
                        ? "bg-green-500 text-white"
                        : status === "current"
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div
                      className={`bg-white rounded-xl p-3 shadow-sm border-2 transition-all duration-300 ${
                        status === "current"
                          ? "border-blue-500 shadow-md"
                          : status === "completed"
                            ? "border-green-200"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4
                          className={`font-semibold text-sm ${
                            status === "current"
                              ? "text-blue-700"
                              : status === "completed"
                                ? "text-green-700"
                                : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </h4>
                        {status === "completed" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {status === "current" && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-xs font-medium">
                              In Progress
                            </span>
                          </div>
                        )}
                      </div>

                      {step.time && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(step.time)}
                        </p>
                      )}

                      {status === "current" && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Currently at this stage</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">
          Order Details
        </h4>

        <div className="space-y-2.5">
          {/* Store */}
          {order.storeId && (
            <div className="flex items-start gap-2.5 p-2 bg-gray-50 rounded-lg">
              <Store className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">
                  {order.storeId.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {order.storeId.address?.street}, {order.storeId.address?.city}
                </p>
              </div>
            </div>
          )}

          {/* Customer */}
          {order.customerId && (
            <div className="flex items-start gap-2.5 p-2 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">
                  {order.customerId.name}
                </p>
                {order.customerId.phone && (
                  <p className="text-xs text-gray-600">
                    {order.customerId.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="flex items-start gap-2.5 p-2 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">
                  Delivery Address
                </p>
                <p className="text-xs text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}{" "}
                  {order.deliveryAddress.zipCode}
                </p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-600">Order Total</span>
            <span className="text-sm font-bold text-green-600">
              R{order.total?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPanel;
