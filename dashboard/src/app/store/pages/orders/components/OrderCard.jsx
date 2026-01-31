import { Clock, User, MapPin, CreditCard, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      placed: "bg-blue-100 text-blue-800 border-blue-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      preparing: "bg-orange-100 text-orange-800 border-orange-300",
      ready_for_pickup: "bg-purple-100 text-purple-800 border-purple-300",
      picked_up: "bg-indigo-100 text-indigo-800 border-indigo-300",
      on_the_way: "bg-cyan-100 text-cyan-800 border-cyan-300",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700",
      processing: "bg-blue-50 text-blue-700",
      succeeded: "bg-green-50 text-green-700",
      failed: "bg-red-50 text-red-700",
      refunded: "bg-gray-50 text-gray-700",
    };
    return colors[status] || "bg-gray-50 text-gray-700";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={() => navigate(`/store/orders/${order._id}`)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">
            #{order.orderNumber}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-base text-gray-900">
            R{order.total.toFixed(2)}
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border mt-1 ${getStatusColor(order.status)}`}
          >
            {order.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-700 font-medium">
          {order.customerId?.name || "Guest"}
        </span>
      </div>

      {/* Delivery Address */}
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
        <span className="text-xs text-gray-600 line-clamp-1">
          {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
        </span>
      </div>

      {/* Items Count */}
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-600">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <CreditCard className="w-3 h-3 text-gray-400" />
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getPaymentStatusColor(order.paymentStatus)}`}
          >
            {order.paymentStatus.toUpperCase()}
          </span>
        </div>
        {order.deliveryFee > 0 && (
          <span className="text-[10px] text-gray-500">
            Delivery: R{order.deliveryFee.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
