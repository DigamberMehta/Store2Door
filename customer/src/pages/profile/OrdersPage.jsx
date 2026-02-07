import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { getOrders } from "../../services/api/order.api";
import toast from "react-hot-toast";
import {
  formatDateOnly,
  formatTimeOnly,
  sortByDateDesc,
} from "../../utils/date";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      const ordersData = response.orders || [];
      // Sort orders by date (newest first)
      const sortedOrders = sortByDateDesc(ordersData, "createdAt");
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError(error, "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-500 bg-yellow-500/10",
      placed: "text-blue-500 bg-blue-500/10",
      confirmed: "text-cyan-500 bg-cyan-500/10",
      preparing: "text-purple-500 bg-purple-500/10",
      ready_for_pickup: "text-indigo-500 bg-indigo-500/10",
      picked_up: "text-orange-500 bg-orange-500/10",
      on_the_way: "text-amber-500 bg-amber-500/10",
      delivered: "text-green-500 bg-green-500/10",
      cancelled: "text-red-500 bg-red-500/10",
      refunded: "text-purple-500 bg-purple-500/10",
    };
    return colors[status] || "text-gray-500 bg-gray-500/10";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      placed: ShoppingBag,
      confirmed: CheckCircle,
      preparing: Package,
      ready_for_pickup: Package,
      picked_up: Truck,
      on_the_way: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      refunded: AlertCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active")
      return !["delivered", "cancelled", "refunded"].includes(order.status);
    if (filter === "completed")
      return ["delivered", "refunded"].includes(order.status);
    return order.status === filter;
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">Your Orders</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-[48px] z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["all", "active", "completed", "cancelled"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === filterOption
                  ? "bg-[rgb(49,134,22)] text-white"
                  : "bg-white/5 text-white/60 active:bg-white/10"
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-3 pt-4 pb-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-2 border-[rgb(49,134,22)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/40 text-sm">Loading orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white/5 rounded-full">
                <ShoppingBag className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/40 text-sm">No orders found</p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 px-4 py-2 bg-[rgb(49,134,22)] text-white text-xs font-medium rounded-lg active:bg-[rgb(49,134,22)]/80 transition-all"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/profile/orders/${order._id}`)}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/5 p-4 active:bg-white/10 transition-all cursor-pointer"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60 text-[10px] font-medium">
                      ORDER #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{formatStatus(order.status)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDateOnly(order.createdAt)} at{" "}
                      {formatTimeOnly(order.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              {order.store && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                  <ShoppingBag className="w-4 h-4 text-white/50" />
                  <span className="text-white text-sm font-medium">
                    {order.store.name}
                  </span>
                </div>
              )}

              {/* Items Count */}
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-white/50" />
                <span className="text-white/70 text-xs">
                  {order.items?.length || 0} item
                  {order.items?.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-white/50 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white/70 text-xs line-clamp-1">
                      {order.deliveryAddress.street}
                    </p>
                    <p className="text-white/40 text-[11px]">
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-white/50" />
                  <span className="text-white/60 text-xs">Total</span>
                </div>
                <span className="text-white font-semibold text-sm">
                  R{order.total?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Quick Actions for Active Orders */}
              {order.status !== "delivered" &&
                order.status !== "cancelled" &&
                order.status !== "refunded" && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order._id}/track`);
                      }}
                      className="w-full px-4 py-2 bg-[rgb(49,134,22)] text-white text-xs font-medium rounded-lg active:bg-[rgb(49,134,22)]/80 transition-all"
                    >
                      Track Order
                    </button>
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
