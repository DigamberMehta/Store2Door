import { useState } from "react";
import {
  Package,
  Clock,
  Store,
  User,
  MapPin,
  AlertCircle,
  Bike,
  ChevronRight,
} from "lucide-react";

const OrderAssignmentSidebar = ({ orders, onOrderSelect, selectedOrder }) => {
  const [activeTab, setActiveTab] = useState("unassigned");
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

  // Separate orders into unassigned and assigned
  const unassignedOrders = orders.filter(
    (order) => !order.riderId && order.status === "pending",
  );

  const assignedOrders = orders.filter(
    (order) =>
      order.riderId &&
      ["assigned", "ready_for_pickup", "picked_up", "on_the_way"].includes(
        order.status,
      ),
  );

  const OrderCard = ({ order, isUnassigned }) => (
    <button
      onClick={() => onOrderSelect(order)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selectedOrder?._id === order._id
          ? "bg-blue-50 border-blue-500 shadow-md"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isUnassigned
                ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {isUnassigned ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Bike className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="font-mono font-bold text-sm text-gray-900">
              #{order.orderNumber}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-green-600">
            R{order.total?.toFixed(2)}
          </span>
          {isUnassigned && (
            <p className="text-[10px] text-orange-600 font-medium mt-1">
              Needs Driver
            </p>
          )}
        </div>
      </div>

      {/* Store */}
      {order.storeId && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 truncate font-medium">
            {order.storeId.name}
          </span>
        </div>
      )}

      {/* Customer */}
      {order.customerId && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {order.customerId.name}
          </span>
        </div>
      )}

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {order.deliveryAddress.street}, {order.deliveryAddress.city}
          </span>
        </div>
      )}

      {/* Rider Info (for assigned orders) */}
      {!isUnassigned && order.riderId && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {order.riderId.name || "Driver"}
                </p>
                {order.riderId.phone && (
                  <p className="text-[10px] text-gray-500">
                    {order.riderId.phone}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </button>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-sm text-gray-500 text-center">No orders</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Tabs */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Order Assignment</h2>

        <div className="flex gap-2 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "unassigned"
                ? "bg-white text-blue-700 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Unassigned
            <span className="ml-1 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
              {unassignedOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("assigned")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "assigned"
                ? "bg-white text-blue-700 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <Bike className="w-4 h-4" />
            Assigned
            <span className="ml-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              {assignedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === "unassigned" ? (
            unassignedOrders.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium">No unassigned orders</p>
                <p className="text-xs mt-1">
                  All orders have been assigned to riders
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassignedOrders.map((order) => (
                  <OrderCard key={order._id} order={order} isUnassigned />
                ))}
              </div>
            )
          ) : assignedOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bike className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">No assigned orders</p>
              <p className="text-xs mt-1">
                Orders will appear here once assigned to riders
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedOrders.map((order) => (
                <OrderCard key={order._id} order={order} isUnassigned={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderAssignmentSidebar;
