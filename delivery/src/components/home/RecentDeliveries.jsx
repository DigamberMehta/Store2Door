import { Package, ArrowUpRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/date";

const RecentDeliveries = ({
  deliveries: rawDeliveries = [],
  loading = false,
}) => {
  const navigate = useNavigate();

  // Format deliveries for display
  const deliveries = (rawDeliveries || []).slice(0, 5).map((d) => {
    return {
      id: d._id || d.id,
      title: d.orderNumber || "Order",
      store: d.storeId?.name || "Store",
      status: d.status || "pending",
      time: formatDate(d.createdAt || d.deliveredAt),
      amount: `R${(d.deliveryFee || 0 + d.tip || 0).toFixed(2)}`,
    };
  });

  const getStatusColor = (status) => {
    const colors = {
      delivered: "bg-emerald-500/10 text-emerald-400",
      cancelled: "bg-red-500/10 text-red-400",
      picked_up: "bg-blue-500/10 text-blue-400",
      on_the_way: "bg-purple-500/10 text-purple-400",
      assigned: "bg-yellow-500/10 text-yellow-400",
    };
    return colors[status] || "bg-zinc-500/10 text-zinc-400";
  };

  if (loading) {
    return (
      <div className="mt-6 pb-2 bg-black">
        <div className="flex items-center justify-between mb-3 px-3">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Recent Deliveries
          </h2>
        </div>
        <div className="space-y-2 px-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-3 border border-white/5 animate-pulse"
            >
              <div className="h-12 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="mt-6 pb-2 bg-black">
        <div className="flex items-center justify-between mb-3 px-3">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Recent Deliveries
          </h2>
        </div>
        <div className="px-3">
          <div className="bg-white/5 rounded-xl p-6 border border-white/5 text-center">
            <p className="text-xs text-zinc-500">No deliveries yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pb-2 bg-black">
      <div className="flex items-center justify-between mb-3 px-3">
        <h2 className="text-sm font-bold text-white tracking-tight">
          Recent Deliveries
        </h2>
        <button
          onClick={() => navigate("/deliveries/all")}
          className="text-xs text-zinc-500 font-medium active:text-blue-300 flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-2 px-3">
        {deliveries.map((delivery) => (
          <button
            key={delivery.id}
            onClick={() => navigate(`/deliveries/all`)}
            className="w-full text-left bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2.5 border ${getStatusColor(delivery.status)}`}
              >
                <Package className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-white truncate">
                  {delivery.title}
                </h3>
                <p className="text-[9px] text-zinc-500 mt-0.5 truncate">
                  {delivery.store} • {delivery.time}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-white">
                  {delivery.amount}
                </p>
                <p
                  className={`text-[9px] font-medium mt-0.5 capitalize ${
                    delivery.status === "delivered"
                      ? "text-emerald-400"
                      : delivery.status === "cancelled"
                        ? "text-red-400"
                        : "text-yellow-400"
                  }`}
                >
                  {delivery.status.replace("_", " ")}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentDeliveries;
