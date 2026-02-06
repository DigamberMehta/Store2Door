import React from "react";
import { Package } from "lucide-react";

const OrderInfoCard = ({ order, orderSnapshot, store }) => {
  const getPaymentStatusColor = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "paid" || status === "completed")
      return "bg-green-100 text-green-800";
    if (status === "failed") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const paymentStatus =
    order?.paymentStatus || orderSnapshot?.paymentStatus || "N/A";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
        <Package className="w-4 h-4 mr-2 text-green-600" />
        Order Information
      </h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Order Number:</span>
          <span className="font-medium text-gray-900">
            {order?.orderNumber || orderSnapshot?.orderNumber}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Order Total:</span>
          <span className="font-medium text-gray-900">
            R {(order?.total || orderSnapshot?.orderTotal || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Order Status:</span>
          <span className="font-medium text-gray-900 capitalize">
            {(order?.status || orderSnapshot?.orderStatus || "N/A").replace(
              /_/g,
              " ",
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Status:</span>
          <span
            className={`font-semibold uppercase text-xs px-2 py-0.5 rounded ${getPaymentStatusColor(paymentStatus)}`}
          >
            {paymentStatus}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Store:</span>
          <span className="font-medium text-gray-900">
            {store?.name || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoCard;
