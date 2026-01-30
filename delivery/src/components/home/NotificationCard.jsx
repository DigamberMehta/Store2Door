import { Package, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";

const NotificationCard = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAvailableOrders();
        setCount(response?.data?.count || 0);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();

    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) {
    return null; // Don't show if no orders
  }

  return (
    <div className="bg-blue-300/[0.07] backdrop-blur-sm rounded-xl p-3 mx-2 mt-2 border border-blue-400/20 animate-beat shadow-[0_0_15px_rgba(59,130,246,0.1)]">
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/10 rounded-lg p-2.5 border border-blue-400/10">
          <Package className="w-4.5 h-4.5 text-blue-300" />
        </div>
        <div className="flex-1">
          <p className="text-[9px] text-blue-300/60 font-bold uppercase tracking-widest mb-1">
            Rush hour, be careful
          </p>
          <h3 className="text-xs font-bold text-white">
            {count} delivery {count === 1 ? "order" : "orders"} found!
          </h3>
          <button
            onClick={() => navigate("/deliveries")}
            className="text-[10px] text-blue-300 font-bold flex items-center gap-1 mt-1.5 active:translate-x-1 transition-transform outline-none focus:outline-none select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            View details
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
