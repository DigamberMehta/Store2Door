import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const RecentOrders = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-indigo-100 text-indigo-800",
      "out-for-delivery": "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "delivered":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
        <Link
          to="/admin/orders"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">No recent orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.storeName || order.store?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    R{order.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
                <Link
                  to={`/admin/orders/${order._id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
