import { MapPin, Package, ArrowRight, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";

const ActiveOrderCard = () => {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveOrder();
  }, []);

  const fetchActiveOrder = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      if (response.success) {
        // Find first active order (assigned or on_the_way)
        const active = response.data?.orders?.find(
          (o) => o.status === "assigned" || o.status === "on_the_way",
        );
        setActiveOrder(active);
      }
    } catch (error) {
      console.error("Error fetching active order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!activeOrder) {
    return null;
  }

  const getStatusText = (status) => {
    if (status === "assigned") return "Head to Store";
    if (status === "on_the_way") return "Delivering";
    return status;
  };

  const getStatusColor = (status) => {
    if (status === "assigned") return "bg-blue-500/10 text-blue-400";
    if (status === "on_the_way") return "bg-purple-500/10 text-purple-400";
    return "bg-white/10 text-white";
  };

  return (
    <div className="mx-2 mt-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Active Order
        </h3>
        <span
          className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(activeOrder.status)}`}
        >
          {getStatusText(activeOrder.status)}
        </span>
      </div>

      <button
        onClick={() => navigate(`/tracking/${activeOrder._id}`)}
        className="w-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/20 active:scale-[0.98] transition-all shadow-lg"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/20 rounded-xl p-2.5 border border-emerald-400/30">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">
                {activeOrder.orderNumber}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {activeOrder.items?.length || 0} items • R
                {(
                  (activeOrder.deliveryFee || 0) + (activeOrder.tip || 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>
          <Navigation className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-[10px] text-zinc-500">Pickup</p>
              <p className="text-xs text-white font-medium">
                {activeOrder.storeId?.name || "Store"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-[10px] text-zinc-500">Dropoff</p>
              <p className="text-xs text-white font-medium">
                {activeOrder.deliveryAddress?.street || "Customer"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] text-zinc-400">Tap to track delivery</p>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </div>
      </button>
    </div>
  );
};

export default ActiveOrderCard;
