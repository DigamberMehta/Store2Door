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
  ChevronDown,
  Store,
  User,
} from "lucide-react";
import BottomNavigation from "../../components/home/BottomNavigation";
import { ordersAPI } from "../../services/api/orders.api";
import { formatDate, sortByDateDesc } from "../../utils/date";

const AllDeliveriesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, delivered, cancelled
  const [deliveries, setDeliveries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    totalEarnings: 0,
  });
  const [expandedId, setExpandedId] = useState(null);

  const limit = 15;

  useEffect(() => {
    fetchDeliveries();
  }, [filter, page]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === "all" ? undefined : filter;
      const response = await ordersAPI.getAllDeliveries(
        page,
        limit,
        statusFilter,
      );

      if (response.success || response.data) {
        const orders = response.data?.orders || response.data || [];
        setDeliveries(orders);
        setHasMore(orders.length === limit);

        // Calculate stats (on first page)
        if (page === 1) {
          const completed = orders.filter(
            (o) => o.status === "delivered",
          ).length;
          const cancelled = orders.filter(
            (o) => o.status === "cancelled",
          ).length;
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
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      cancelled: "text-red-400 bg-red-500/10 border-red-500/30",
      picked_up: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      on_the_way: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      assigned: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      pending: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
      placed: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
      confirmed: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      preparing: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      ready_for_pickup: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    };
    return colors[status] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
  };

  const getStatusIcon = (status) => {
    if (status === "delivered") return <CheckCircle className="w-4 h-4" />;
    if (status === "cancelled") return <XCircle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const formatStatusText = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-xl font-bold">All Deliveries</p>
            <p className="text-xs text-zinc-500">Complete delivery history</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Only on first page */}
      {page === 1 && (
        <div className="px-4 pt-4 pb-3">
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
              <p className="text-lg font-bold text-red-400">
                {stats.cancelled}
              </p>
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
      )}

      {/* Filter Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "all"
              ? "bg-white text-black"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter("delivered");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "delivered"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => {
            setFilter("cancelled");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filter === "cancelled"
              ? "bg-red-500/20 border border-red-500/30 text-red-400"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Deliveries List */}
      <div className="px-4 py-3 space-y-2">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
          </div>
        )}

        {!loading && deliveries.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No deliveries found</p>
          </div>
        )}

        {!loading &&
          deliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/8 transition-colors"
            >
              {/* Main Card */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === delivery._id ? null : delivery._id,
                  )
                }
                className="w-full p-3 text-left active:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{delivery.orderNumber}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {formatDate(delivery.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${getStatusColor(
                      delivery.status,
                    )}`}
                  >
                    {getStatusIcon(delivery.status)}
                    <span>{formatStatusText(delivery.status)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {/* Store Info */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <Store className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    <p className="text-zinc-300 truncate">
                      {delivery.storeId?.name || "Unknown Store"}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <User className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    <p className="text-zinc-300 truncate">
                      {delivery.customerId?.name || "Unknown Customer"}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    <p className="text-zinc-300 truncate">
                      {delivery.deliveryAddress?.city},
                      {delivery.deliveryAddress?.state}
                    </p>
                  </div>

                  {/* Earnings */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                    <div className="flex items-center gap-2 text-[11px]">
                      <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-blue-400 font-bold">
                        R
                        {(
                          delivery.deliveryFee ||
                          0 + delivery.tip ||
                          0
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500">
                      <span className="text-[10px]">
                        {delivery.items?.length || 0} items
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedId === delivery._id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === delivery._id && (
                <div className="bg-black/40 border-t border-white/5 p-3 space-y-3">
                  {/* Items */}
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 mb-2">
                      ITEMS ({delivery.items?.length || 0})
                    </p>
                    <div className="space-y-1">
                      {delivery.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-[10px]"
                        >
                          <span className="text-zinc-300">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-zinc-400">
                            R{item.totalPrice?.toFixed(2) || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-white/5 rounded-lg p-2.5 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="text-zinc-300">
                        R{delivery.subtotal?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">Delivery Fee</span>
                      <span className="text-blue-400">
                        +R{delivery.deliveryFee?.toFixed(2) || 0}
                      </span>
                    </div>
                    {delivery.tip > 0 && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-400">Tip</span>
                        <span className="text-emerald-400">
                          +R{delivery.tip?.toFixed(2) || 0}
                        </span>
                      </div>
                    )}
                    {delivery.discount > 0 && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-400">Discount</span>
                        <span className="text-red-400">
                          -R{delivery.discount?.toFixed(2) || 0}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex justify-between text-[11px] font-bold">
                      <span>Total</span>
                      <span>R{delivery.total?.toFixed(2) || 0}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 mb-1.5">
                      DELIVERY ADDRESS
                    </p>
                    <div className="bg-white/5 rounded-lg p-2 text-[10px] text-zinc-300">
                      <p>{delivery.deliveryAddress?.street}</p>
                      <p>
                        {delivery.deliveryAddress?.city},
                        {delivery.deliveryAddress?.state}{" "}
                        {delivery.deliveryAddress?.postalCode}
                      </p>
                      <p className="text-zinc-500 mt-1">
                        {delivery.deliveryAddress?.country}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {delivery.trackingHistory?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 mb-2">
                        TRACKING HISTORY
                      </p>
                      <div className="space-y-1 text-[9px]">
                        {delivery.trackingHistory.map((track, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-zinc-400"
                          >
                            <span className="capitalize">
                              {formatStatusText(track.status)}
                            </span>
                            <span className="text-zinc-500">
                              {formatDate(track.updatedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/order-detail/${delivery._id}`)}
                    className="w-full py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[11px] font-bold rounded-lg active:bg-blue-500/30 transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Pagination */}
      {!loading && deliveries.length > 0 && (
        <div className="px-4 py-4 flex gap-2 justify-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white/5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="px-4 py-2 rounded-lg bg-white/10 text-sm font-bold">
            Page {page}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            className="px-4 py-2 rounded-lg bg-white/5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default AllDeliveriesPage;
