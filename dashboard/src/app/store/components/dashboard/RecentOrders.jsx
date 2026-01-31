import { Clock, CircleCheck, Truck, XCircle } from "lucide-react";

const RecentOrders = ({ orders }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CircleCheck className="w-4 h-4" />;
      case "in_transit":
        return <Truck className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
        <button className="text-xs font-medium text-green-600 hover:text-green-700">
          View All
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No recent orders</p>
            <p className="text-sm text-gray-500 mt-1">
              Orders will appear here once customers place them
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-gray-900">#{order.id}</p>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.customer}</p>
                <p className="text-xs text-gray-500 mt-1">{order.time}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  R{order.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.items} items
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
