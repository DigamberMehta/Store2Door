import { Package } from "lucide-react";

const OrderItemsList = ({ items }) => {
  return (
    <div className="pt-2 border-t border-white/5">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
        <Package className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
        Items ({items?.length || 0})
      </h3>
      <div className="space-y-1.5">
        {items?.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-medium mr-2 text-zinc-400">
                x{item.quantity}
              </span>
              <span className="text-[11px] text-zinc-300 truncate">
                {item.productId?.name || item.name || "Product"}
              </span>
            </div>
            <span className="text-[11px] font-medium text-white ml-2">
              R
              {((item.unitPrice || item.price || 0) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;
