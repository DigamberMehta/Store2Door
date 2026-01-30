import { Package } from "lucide-react";

const OrderItemsList = ({ items }) => {
  return (
    <div className="pt-2 border-t border-white/5">
      <h3 className="font-semibold text-white mb-3 flex items-center">
        <Package className="w-4 h-4 mr-2 text-zinc-400" />
        Items ({items?.length || 0})
      </h3>
      <div className="space-y-2">
        {items?.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span className="bg-white/10 px-2 py-1 rounded text-xs font-medium mr-2 text-zinc-300">
                x{item.quantity}
              </span>
              <span className="text-zinc-300">
                {item.productId?.name || item.name || "Product"}
              </span>
            </div>
            <span className="font-medium text-white">
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
