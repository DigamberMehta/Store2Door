import React from "react";
import { ShoppingBag } from "lucide-react";

const OrderItemsCard = ({ order }) => {
  if (!order?.items || order.items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
        Order Items
      </h3>
      <div className="space-y-3">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            {item.productId?.images?.[0] && (
              <img
                src={item.productId.images[0]}
                alt={item.productId.name || item.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                {item.productId?.name || item.name || "Unknown Product"}
              </p>
              <p className="text-xs text-gray-600">
                Qty: {item.quantity} × R {(item.unitPrice || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                R {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              R {(order.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="font-medium">
              R {(order.deliveryFee || 0).toFixed(2)}
            </span>
          </div>
          {order.tip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip:</span>
              <span className="font-medium">R {order.tip.toFixed(2)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span className="font-medium">
                - R {order.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>R {(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsCard;
