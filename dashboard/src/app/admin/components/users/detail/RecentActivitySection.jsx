import {
  Package,
  Clock,
  DollarSign,
  Store as StoreIcon,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

const RecentActivitySection = ({
  orders,
  deliveries,
  storeOrders,
  role,
  userId,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-indigo-100 text-indigo-800",
      picked_up: "bg-orange-100 text-orange-800",
      on_the_way: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status?.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  // Render for customers
  if (role === "customer" && orders) {
    const displayedOrders = orders.slice(0, 10);
    const hasMoreOrders = orders.length > 10;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Orders ({orders.length})
          </h2>
          {orders.length > 0 && (
            <Link
              to={`/admin/users/${userId}/orders`}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        {displayedOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet</p>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="divide-y divide-gray-200">
              {displayedOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between py-3 first:pt-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-gray-600">
                        {order.storeId?.name || "Store"}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render for delivery riders
  if (role === "delivery_rider" && deliveries) {
    const displayedDeliveries = deliveries.slice(0, 10);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Deliveries ({deliveries.length})
          </h2>
          {deliveries.length > 0 && (
            <Link
              to={`/admin/users/${userId}/deliveries`}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        {displayedDeliveries.length === 0 ? (
          <p className="text-sm text-gray-500">No deliveries yet</p>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-2 pr-2">
              {displayedDeliveries.map((delivery) => (
                <div
                  key={delivery._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">
                          Delivery #{delivery._id.slice(-6).toUpperCase()}
                        </span>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <p className="text-xs text-gray-600">
                        {delivery.storeId?.name || "Store"} →{" "}
                        {delivery.customerId?.name || "Customer"}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(delivery.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(delivery.deliveryFee)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render for store managers
  if (role === "store_manager" && storeOrders) {
    const displayedOrders = storeOrders.slice(0, 10);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Store Orders ({storeOrders.length})
          </h2>
          {storeOrders.length > 0 && (
            <Link
              to={`/admin/users/${userId}/orders`}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        {displayedOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet</p>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-2 pr-2">
              {displayedOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-gray-600">
                        Customer: {order.customerId?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default RecentActivitySection;
