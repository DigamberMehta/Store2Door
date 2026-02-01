import { ShoppingBag, CheckCircle2 } from "lucide-react";

const ActionButtons = ({
  order,
  isUpdatingStatus,
  onPickup,
  onMarkDelivered,
}) => {
  return (
    <div className="space-y-2.5 pt-2">
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-2 rounded-lg">
        <span className="text-[11px] text-zinc-400 font-medium">
          Your Earnings
        </span>
        <span className="text-emerald-400 font-bold text-base">
          R{order.deliveryFee?.toFixed(2) || "0.00"}
        </span>
      </div>

      {/* Pickup Button - Show when order is assigned to driver or ready for pickup */}
      {(order.status === "assigned" ||
        order.status === "ready_for_pickup" ||
        order.status === "confirmed" ||
        order.status === "preparing") && (
        <button
          onClick={onPickup}
          disabled={isUpdatingStatus}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Picking up...
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Pick Up from Store
            </>
          )}
        </button>
      )}

      {/* Delivered Button - Show only when on the way to customer */}
      {order.status === "on_the_way" && (
        <button
          onClick={onMarkDelivered}
          disabled={isUpdatingStatus}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Delivered
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
