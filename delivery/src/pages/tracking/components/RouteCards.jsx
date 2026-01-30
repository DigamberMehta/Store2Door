import { Store, MapPin, Phone } from "lucide-react";

const RouteCards = ({ order }) => {
  return (
    <div className="space-y-3">
      {/* Store Card */}
      <div className="flex p-3 bg-white/5 border border-white/5 rounded-xl items-center">
        <div className="p-2 bg-white/10 rounded-full shadow-sm text-orange-400 mr-3">
          <Store size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {order.storeId?.name || "Store"}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {order.storeId?.address?.street || "Store address"}
          </p>
        </div>
        <button className="p-2 bg-white/10 hover:bg-white/15 rounded-full shadow-sm text-orange-400 transition-colors">
          <Phone size={16} />
        </button>
      </div>

      {/* Customer Card */}
      <div className="flex p-3 bg-white/5 border border-white/5 rounded-xl items-center">
        <div className="p-2 bg-white/10 rounded-full shadow-sm text-emerald-400 mr-3">
          <MapPin size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {order.customerId?.name || "Customer"}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {order.deliveryAddress?.street || "Delivery address"}
          </p>
          {order.deliveryAddress?.instructions && (
            <p className="text-xs text-zinc-500 mt-1">
              Note: {order.deliveryAddress.instructions}
            </p>
          )}
        </div>
        <button className="p-2 bg-white/10 hover:bg-white/15 rounded-full shadow-sm text-emerald-400 transition-colors">
          <Phone size={16} />
        </button>
      </div>
    </div>
  );
};

export default RouteCards;
