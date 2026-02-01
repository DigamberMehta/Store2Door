import { Store, MapPin, Phone } from "lucide-react";

const RouteCards = ({ order }) => {
  return (
    <div className="space-y-2">
      {/* Order ID */}
      <div className="flex p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg items-center justify-between">
        <p className="text-[10px] text-zinc-500 font-medium">Order ID</p>
        <p className="font-mono text-[11px] font-bold text-emerald-400">
          #{order.orderNumber}
        </p>
      </div>

      {/* Store Card */}
      <div className="flex p-2 bg-white/5 border border-white/5 rounded-lg items-center">
        <div className="p-1.5 bg-white/10 rounded-lg text-orange-400 mr-2">
          <Store size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-white truncate">
            {order.storeId?.name || "Store"}
          </p>
          <p className="text-[9px] text-zinc-500 truncate">
            {order.storeId?.address?.street || "Store address"}
          </p>
        </div>
        <button className="p-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-orange-400 transition-colors">
          <Phone size={14} />
        </button>
      </div>

      {/* Customer Card */}
      <div className="flex p-2 bg-white/5 border border-white/5 rounded-lg items-center">
        <div className="p-1.5 bg-white/10 rounded-lg text-emerald-400 mr-2">
          <MapPin size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-white truncate">
            {order.customerId?.name || "Customer"}
          </p>
          <p className="text-[9px] text-zinc-500 truncate">
            {order.deliveryAddress?.street || "Delivery address"}
          </p>
          {order.deliveryAddress?.instructions && (
            <p className="text-[9px] text-zinc-600 mt-0.5">
              Note: {order.deliveryAddress.instructions}
            </p>
          )}
        </div>
        <button className="p-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-emerald-400 transition-colors">
          <Phone size={14} />
        </button>
      </div>
    </div>
  );
};

export default RouteCards;
