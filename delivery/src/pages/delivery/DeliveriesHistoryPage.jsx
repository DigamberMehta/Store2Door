import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";
import { ordersAPI } from "../../services/api/orders.api";
import { formatDate, sortByDateDesc } from "../../utils/date";

const DeliveriesHistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, completed, cancelled
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchDeliveries();
  }, [filter]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === "all" ? undefined : filter;
      const response = await ordersAPI.getMyOrders(statusFilter);

      if (response.success) {
        // Backend returns { orders, count } in data
        const orders = response.data?.orders || [];
        // Sort deliveries by date (newest first)
        const sortedOrders = sortByDateDesc(orders, "createdAt");
        setDeliveries(sortedOrders);

        // Calculate stats
        const completed = orders.filter((o) => o.status === "delivered").length;
        const cancelled = orders.filter((o) => o.status === "cancelled").length;
        const totalEarnings = orders
          .filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + (o.deliveryFee || 0) + (o.tip || 0), 0);

        setStats({
          total: orders.length,
          completed,
          cancelled,
          totalEarnings,
        });
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: "text-emerald-400 bg-emerald-500/10",
      cancelled: "text-red-400 bg-red-500/10",
      picked_up: "text-blue-400 bg-blue-500/10",
      on_the_way: "text-purple-400 bg-purple-500/10",
      assigned: "text-yellow-400 bg-yellow-500/10",
      refunded: "text-purple-400 bg-purple-500/10",
    };
    return colors[status] || "text-zinc-400 bg-zinc-500/10";
  };

  const getStatusIcon = (status) => {
    if (status === "delivered") return <CheckCircle className="w-4 h-4" />;
    if (status === "cancelled") return <XCircle className="w-4 h-4" />;
    if (status === "refunded") return <XCircle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-xl font-bold">Delivery History</p>
            <p className="text-xs text-zinc-500">
              {stats.total} total deliveries
            </p>
          </div>
        </div>
        <button className="p-2 bg-white/5 rounded-xl">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
            <Package className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-[9px] text-zinc-500 uppercase">Total</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-400">
              {stats.completed}
            </p>
            <p className="text-[9px] text-zinc-500 uppercase">Done</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
            <XCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-400">{stats.cancelled}</p>
            <p className="text-[9px] text-zinc-500 uppercase">Cancel</p>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
            <DollarSign className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-400">
              R{stats.totalEarnings.toFixed(0)}
            </p>
            <p className="text-[9px] text-zinc-500 uppercase">Earned</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "all"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          All Deliveries
        </button>
        <button
          onClick={() => setFilter("delivered")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "delivered"
              ? "bg-emerald-500 text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "cancelled"
              ? "bg-red-500 text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Cancelled
        </button>
        <button
          onClick={() => setFilter("on_the_way")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "on_the_way"
              ? "bg-purple-500 text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          In Progress
        </button>
      </div>

      {/* Deliveries List */}
      <div className="px-4 space-y-3 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No deliveries found</p>
            <p className="text-xs text-zinc-600 mt-1">
              {filter === "all"
                ? "Complete your first delivery to see it here"
                : `No ${filter} deliveries`}
            </p>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <div
              key={delivery._id}
              onClick={() => {
                // Navigate to tracking only if order is active, otherwise show details
                if (
                  delivery.status === "assigned" ||
                  delivery.status === "on_the_way"
                ) {
                  navigate(`/tracking/${delivery._id}`);
                } else {
                  navigate(`/order/${delivery._id}`);
                }
              }}
              className="bg-white/5 border border-white/5 rounded-2xl p-4 active:bg-white/10 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl ${getStatusColor(delivery.status)}`}
                  >
                    {getStatusIcon(delivery.status)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {delivery.orderNumber}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatDate(delivery.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    +R
                    {(
                      (delivery.deliveryFee || 0) + (delivery.tip || 0)
                    ).toFixed(2)}
                  </p>
                  <p
                    className={`text-[9px] font-bold uppercase mt-0.5 ${getStatusColor(delivery.status)}`}
                  >
                    {delivery.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Store & Customer Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">Pickup</p>
                    <p className="text-xs text-white font-medium">
                      {delivery.storeId?.name || "Store"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">Dropoff</p>
                    <p className="text-xs text-white font-medium">
                      {delivery.deliveryAddress?.street || "Customer Address"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>{delivery.items?.length || 0} items</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Fee: R{(delivery.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                  {delivery.tip > 0 && (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Tip: R{delivery.tip.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DeliveriesHistoryPage;
