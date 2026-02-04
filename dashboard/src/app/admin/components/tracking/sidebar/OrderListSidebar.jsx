import {
  Package,
  Clock,
  MapPin,
  Store,
  User,
  Bike,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const OrderListSidebar = ({ orders, selectedOrder, onOrderSelect }) => {
  const formatTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        color: "bg-gray-100 text-gray-700",
        icon: AlertCircle,
        badgeColor: "bg-gray-500",
      },
      assigned: {
        label: "Assigned",
        color: "bg-orange-100 text-orange-700",
        icon: Bike,
        badgeColor: "bg-orange-500",
      },
      ready_for_pickup: {
        label: "Ready for Pickup",
        color: "bg-yellow-100 text-yellow-700",
        icon: Store,
        badgeColor: "bg-yellow-500",
      },
      picked_up: {
        label: "Picked Up",
        color: "bg-blue-100 text-blue-700",
        icon: Package,
        badgeColor: "bg-blue-500",
      },
      on_the_way: {
        label: "On the Way",
        color: "bg-purple-100 text-purple-700",
        icon: Bike,
        badgeColor: "bg-purple-500",
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        badgeColor: "bg-green-500",
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
        badgeColor: "bg-red-500",
      },
    };
    return configs[status] || configs.pending;
  };

  const groupOrdersByStatus = () => {
    if (!orders) return {};

    return orders.reduce((acc, order) => {
      const status = order.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(order);
      return acc;
    }, {});
  };

  const groupedOrders = groupOrdersByStatus();
  const statusOrder = [
    "assigned",
    "ready_for_pickup",
    "picked_up",
    "on_the_way",
    "pending",
    "delivered",
    "cancelled",
  ];

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-sm text-gray-500 text-center">No active orders</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {statusOrder.map((status) => {
          const ordersInStatus = groupedOrders[status];
          if (!ordersInStatus || ordersInStatus.length === 0) return null;

          const statusConfig = getStatusConfig(status);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={status} className="space-y-2">
              {/* Status Header */}
              <div className="flex items-center gap-2 px-2">
                <div
                  className={`w-2 h-2 rounded-full ${statusConfig.badgeColor}`}
                ></div>
                <h3 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">
                  {statusConfig.label}
                </h3>
                <span className="text-xs text-gray-500">
                  ({ordersInStatus.length})
                </span>
              </div>

              {/* Orders */}
              <div className="space-y-2">
                {ordersInStatus.map((order) => (
                  <button
                    key={order._id}
                    onClick={() => onOrderSelect(order)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedOrder?._id === order._id
                        ? "bg-blue-50 border-blue-500 shadow-md"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-xs text-gray-900">
                            #{order.orderNumber}
                          </p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        R{order.total?.toFixed(2)}
                      </span>
                    </div>

                    {/* Store */}
                    {order.storeId && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs">
                        <Store className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate font-medium">
                          {order.storeId.name}
                        </span>
                      </div>
                    )}

                    {/* Customer */}
                    {order.customerId && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs">
                        <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">
                          {order.customerId.name}
                        </span>
                      </div>
                    )}

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">
                          {order.deliveryAddress.street},{" "}
                          {order.deliveryAddress.city}
                        </span>
                      </div>
                    )}

                    {/* Rider (if assigned) */}
                    {order.riderId && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Bike className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">
                            {order.riderId.name || "Driver"}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderListSidebar;
