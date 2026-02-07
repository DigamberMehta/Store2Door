import React from "react";
import { Edit, UserPlus, X, RefreshCw, XOctagon } from "lucide-react";

const OrderActions = ({
  order,
  onUpdateStatus,
  onAssignRider,
  onCancel,
  onReject,
}) => {
  const canUpdateStatus = ![
    "delivered",
    "cancelled",
    "rejected",
    "refunded",
  ].includes(order.status);
  const canAssignRider =
    !order.riderId &&
    !["cancelled", "delivered", "rejected", "refunded"].includes(order.status);
  const canCancel = ![
    "delivered",
    "cancelled",
    "rejected",
    "refunded",
  ].includes(order.status);
  const canReject =
    ["pending", "placed", "confirmed", "preparing"].includes(order.status) &&
    !["cancelled", "delivered", "rejected", "refunded"].includes(order.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3">
        Quick Actions
      </h2>
      <div className="space-y-2">
        {canUpdateStatus && (
          <button
            onClick={onUpdateStatus}
            className="w-full flex items-center justify-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Update Status
          </button>
        )}

        {canAssignRider && (
          <button
            onClick={onAssignRider}
            className="w-full flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 mr-2" />
            Assign Rider
          </button>
        )}

        {canReject && (
          <button
            onClick={onReject}
            className="w-full flex items-center justify-center px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <XOctagon className="w-3.5 h-3.5 mr-2" />
            Reject Order
          </button>
        )}

        {canCancel && (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 mr-2" />
            Cancel Order
          </button>
        )}

        {!canUpdateStatus && !canAssignRider && !canCancel && !canReject && (
          <p className="text-xs text-gray-500 text-center py-3">
            No actions available for this order
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderActions;
